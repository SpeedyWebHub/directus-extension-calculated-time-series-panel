## Features Overview

Available panel properties for configuring via the Directus Insights graphical user interface:
- fields (example: `income.netto, expenses.netto`)
- expression (example: `sum(attr(income, "netto")) - sum(attr(expenses, "netto"))`)
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

The extension utilizes math.js as expression parser.
Look up the official documentation of math.js for the list of supported operations in the expression.
Additionally, the following math.js extension functions are supported for working with collections:

`sum, avg, count, attr, max, min, median, round, ceil, floor, abs`

Thanks to the `attr` function it is possible access any field of any available collection using the syntax `attr(<collectionName>, "<fieldName>")` (see examples above)


