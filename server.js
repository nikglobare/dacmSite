const express = require('express');
const cors = require('cors');
const { queryDatabase } = require('./db');
const { config, configTPUT, configDB2 } = require('./config');

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the "public" directory
app.use(express.static('public'));

app.use(express.json());

// Route to get ranked, grouped, and image-associated data
app.get('/api/ranked-data', async (req, res) => {
    const query = `
        WITH RankedData AS (
            SELECT *,
                ROW_NUMBER() OVER (ORDER BY DateTime ASC) AS Rank
            FROM [dbo].[Existing]
        ),
        GroupedData AS (
            SELECT *,
                CASE
                    WHEN Rank BETWEEN 1 AND 34 THEN 1
                    WHEN Rank BETWEEN 35 AND 73 THEN 2
                    WHEN Rank BETWEEN 74 AND 75 THEN 3
                    WHEN Rank BETWEEN 76 AND 78 THEN 4
                    WHEN Rank BETWEEN 79 AND 120 THEN 5
                    WHEN Rank BETWEEN 121 AND 128 THEN 6
                    WHEN Rank BETWEEN 129 AND 136 THEN 7
                    WHEN Rank BETWEEN 137 AND 177 THEN 8
                    WHEN Rank BETWEEN 178 AND 183 THEN 9
                    WHEN Rank BETWEEN 184 AND 188 THEN 10
                    WHEN Rank BETWEEN 189 AND 220 THEN 11
                END AS GroupNumber,
                CASE
                    WHEN [Problem Count] > 0 THEN 'red.png'
                    ELSE 'white.png'
                END AS Photo
            FROM RankedData
        )
        SELECT *
        FROM GroupedData
        WHERE Rank <= 220
        ORDER BY Rank;
    `;
    try {
        const result = await queryDatabase(query, configTPUT);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error querying the database:', err);
        res.status(500).send('Error querying the database');
    }
});

// Route to get data from PlannedJPH table using configTPUT
app.get('/api/jph-data', async (req, res) => {
    const query = `
        SELECT 
            [Center],  
            [Design_Gross],
            [JPHNet]
        FROM [dbo].[PlannedJPH]
        WHERE plant = 'dacm'
            AND FORMAT(CurrMonth, 'yyyyMM') = FORMAT(GETDATE(), 'yyyyMM')
    `;
    try {
        console.log('Using configTPUT for database connection:', configTPUT); // Log connection details
        const result = await queryDatabase(query, configTPUT);
        console.log('Query result:', JSON.stringify(result.recordset)); // Log query result to verify JSON format
        res.json(result.recordset);
    } catch (err) {
        console.error('Error querying the database:', err.message); // Log detailed error message
        console.error(err); // Log the entire error object for more information
        res.status(500).send('Error querying the database');
    }
});

// Example route to query DB2 database
app.get('/api/db2-data', async (req, res) => {
    const query = `WITH MaxShift AS (
        SELECT I_PLT, D_SUMM_REPTD, I_PROD_HR_REPTD, C_STATUS, MAX(I_SHIFT_REPTD) AS MaxShift
        FROM MIMSYS.MGTSUM_BC 
        WHERE D_SUMM_REPTD = TRUNC(SYSDATE) AND C_RECTYPE = 'Y'
        GROUP BY I_PLT, D_SUMM_REPTD, I_PROD_HR_REPTD, C_STATUS
    )
    SELECT 
        mg.I_PLT, 
        mg.D_SUMM_REPTD, 
        mg.I_SHIFT_REPTD, 
        mg.I_PROD_HR_REPTD, 
        mg.C_STATUS, 
        SUM(mg.I_OCC_CNT) AS I_OCC_CNT
    FROM 
        MIMSYS.MGTSUM_BC mg
    JOIN 
        MaxShift ms
    ON 
        mg.I_PLT = ms.I_PLT 
        AND mg.D_SUMM_REPTD = ms.D_SUMM_REPTD 
        AND mg.I_PROD_HR_REPTD = ms.I_PROD_HR_REPTD 
        AND mg.C_STATUS = ms.C_STATUS 
        AND mg.I_SHIFT_REPTD = ms.MaxShift
    GROUP BY 
        mg.I_PLT, mg.D_SUMM_REPTD, mg.I_SHIFT_REPTD, mg.I_PROD_HR_REPTD, mg.C_STATUS;`; // Replace with your DB2 query
        try {
            const result = await queryDatabase(query, configDB2);
            res.json(result); // Adjust according to the structure of the result
        } catch (err) {
            console.error('Error querying the DB2 database:', err);
            res.status(500).send('Error querying the DB2 database');
        }
    });

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
