## Features Overview

Available panel properties for configuring via the Directus Insights graphical user interface (the provided examples correspond to a multiseries bar chart with 3 series - income, expenses, profit):
- fields (example: `income.netto, expenses.netto`)
- value expressions (example: `sum(attr(income, "netto")); sum(attr(expenses, "netto")); sum(attr(income, "netto")) - sum(attr(expenses, "netto"))`)
- value labels (example: `income, expenses, profit`)
- filters (example: `{"income": {
    "_and": [
        {
            "issue_date": {
                "_gte": "{{start_date}}"
            }
        },
        {
            "issue_date": {
                "_lte": "{{end_date}}"
            }
        }
    ]
}, "expenses": {
    "_and": [
        {
            "date": {
                "_gte": "{{start_date}}"
            }
        },
        {
            "date": {
                "_lte": "{{end_date}}"
            }
        }
    ]
}}`)
- chart type (available options: `bar`, `line`)
- time fields (example: `income.issue_date, expenses.date`)
- group precission (available options: `second`, `minute`, `hour`, `day`, `week`, `month`, `year`)
- colors (example: `green, red, yellow`)
- date range (example: `Past 12 months`)

The extension utilizes math.js as expression parser.
Look up the official documentation of math.js for the list of supported operations in the expression.
Additionally, the following math.js extension functions are supported for working with collections:

`sum, avg, count, attr, max, min, median, round, ceil, floor, abs`

Thanks to the `attr` function it is possible access any field of any available collection using the syntax `attr(<collectionName>, "<fieldName>")` (see examples above)

Each expression is processed in the context of the current time interval. For example if the `sum` function is used in `valueExpressions`, and the precision is set to `month` then the sum is calculated over items corresponding to each of the individual months in the range. If the range is 12 months, then each of the `valueExpressions` expressions provided will be evaluated exactly 13 times (past 12 months + current month). The size of the time intervals is determined by the `precision` property which indicates the grouping behaviour of the data processing algorithm and the range is determined by the `range` property.

Note: leading and trailing multiseries zero valu entries will be automatically removed from the chart to simplify the chart and improve readability, unless it would result in no data being displayed at all.


