/**
 * Role Competency Data, Prerequisite Graphs, Diagnostic Question Banks, and Project Specifications
 * Conforms to Master System Prompt Sections 2, 4, 5, 6, 7, 8, 9, 13
 */

const ROLE_COMPETENCY_MAPS = {
  "Data Analyst": {
    title: "Data Analyst",
    description: "Analyzes datasets to identify trends, create visualizations, and extract actionable business insights.",
    competencies: {
      "Python": { required_level: 4, importance: 0.9, category: "Programming" },
      "SQL": { required_level: 4, importance: 1.0, category: "Databases" },
      "Excel": { required_level: 3, importance: 0.8, category: "Data Tools" },
      "Statistics": { required_level: 3, importance: 0.85, category: "Fundamentals" },
      "Data Cleaning": { required_level: 4, importance: 0.95, category: "Data Wrangling" },
      "Data Visualization": { required_level: 4, importance: 0.9, category: "Reporting" },
      "Power BI": { required_level: 3, importance: 0.75, category: "BI Tools" },
      "Business Analysis": { required_level: 3, importance: 0.7, category: "Domain" },
      "Communication": { required_level: 3, importance: 0.75, category: "Soft Skills" }
    },
    prerequisites: {
      "Data Cleaning": ["Python", "Excel"],
      "Data Visualization": ["Statistics", "Excel"],
      "Power BI": ["SQL", "Data Visualization"],
      "Business Analysis": ["Statistics", "Communication"],
      "SQL": []
    }
  },
  "AI / Machine Learning Engineer": {
    title: "AI / Machine Learning Engineer",
    description: "Designs, develops, and deploys intelligent models and algorithms that learn from data to solve complex prediction problems.",
    competencies: {
      "Python": { required_level: 5, importance: 1.0, category: "Programming" },
      "Linear Algebra & Calculus": { required_level: 4, importance: 0.85, category: "Fundamentals" },
      "Probability & Statistics": { required_level: 4, importance: 0.9, category: "Fundamentals" },
      "Data Preprocessing": { required_level: 4, importance: 0.9, category: "Data Wrangling" },
      "Machine Learning Algorithms": { required_level: 4, importance: 0.95, category: "Modeling" },
      "Deep Learning (PyTorch/TF)": { required_level: 4, importance: 0.9, category: "Modeling" },
      "MLOps & Deployment": { required_level: 3, importance: 0.8, category: "Engineering" },
      "SQL & Data Pipelines": { required_level: 3, importance: 0.75, category: "Databases" },
      "Model Evaluation & Ethics": { required_level: 4, importance: 0.85, category: "Governance" }
    },
    prerequisites: {
      "Probability & Statistics": ["Linear Algebra & Calculus"],
      "Data Preprocessing": ["Python"],
      "Machine Learning Algorithms": ["Python", "Probability & Statistics", "Data Preprocessing"],
      "Deep Learning (PyTorch/TF)": ["Machine Learning Algorithms", "Linear Algebra & Calculus"],
      "MLOps & Deployment": ["Python", "Deep Learning (PyTorch/TF)"],
      "Model Evaluation & Ethics": ["Machine Learning Algorithms"]
    }
  },
  "Full-Stack Developer": {
    title: "Full-Stack Developer",
    description: "Builds responsive client-facing user interfaces and scalable server-side systems and databases.",
    competencies: {
      "JavaScript / TypeScript": { required_level: 4, importance: 1.0, category: "Frontend" },
      "HTML & Modern CSS": { required_level: 4, importance: 0.85, category: "Frontend" },
      "React / Frontend Framework": { required_level: 4, importance: 0.95, category: "Frontend" },
      "Node.js / Backend API": { required_level: 4, importance: 0.9, category: "Backend" },
      "SQL & Relational Databases": { required_level: 3, importance: 0.85, category: "Databases" },
      "RESTful API Design": { required_level: 4, importance: 0.9, category: "Architecture" },
      "Git & Version Control": { required_level: 4, importance: 0.8, category: "Engineering" },
      "Authentication & Security": { required_level: 3, importance: 0.8, category: "Security" },
      "DevOps & CI/CD Basics": { required_level: 2, importance: 0.65, category: "Deployment" }
    },
    prerequisites: {
      "JavaScript / TypeScript": ["HTML & Modern CSS"],
      "React / Frontend Framework": ["JavaScript / TypeScript"],
      "Node.js / Backend API": ["JavaScript / TypeScript"],
      "RESTful API Design": ["Node.js / Backend API"],
      "Authentication & Security": ["Node.js / Backend API", "SQL & Relational Databases"],
      "DevOps & CI/CD Basics": ["Git & Version Control"]
    }
  },
  "Cloud & DevOps Engineer": {
    title: "Cloud & DevOps Engineer",
    description: "Automates infrastructure, continuous delivery pipelines, monitoring, and cloud deployment resilience.",
    competencies: {
      "Linux & Bash Scripting": { required_level: 4, importance: 0.95, category: "Systems" },
      "Docker & Containerization": { required_level: 4, importance: 0.95, category: "Containers" },
      "Kubernetes": { required_level: 3, importance: 0.85, category: "Orchestration" },
      "Cloud Infrastructure (AWS/GCP)": { required_level: 4, importance: 1.0, category: "Cloud" },
      "Infrastructure as Code (Terraform)": { required_level: 3, importance: 0.85, category: "IaC" },
      "CI/CD Pipelines (GitHub Actions)": { required_level: 4, importance: 0.9, category: "Automation" },
      "Monitoring & Observability": { required_level: 3, importance: 0.75, category: "Operations" },
      "Networking & Cloud Security": { required_level: 3, importance: 0.8, category: "Security" }
    },
    prerequisites: {
      "Docker & Containerization": ["Linux & Bash Scripting"],
      "Kubernetes": ["Docker & Containerization"],
      "Infrastructure as Code (Terraform)": ["Cloud Infrastructure (AWS/GCP)"],
      "CI/CD Pipelines (GitHub Actions)": ["Docker & Containerization"],
      "Monitoring & Observability": ["Kubernetes", "Cloud Infrastructure (AWS/GCP)"]
    }
  }
};

const DIAGNOSTIC_QUESTION_BANK = [
  // --- SQL QUESTIONS ---
  {
    id: "sql_101",
    skill: "SQL",
    difficulty: 1,
    type: "conceptual",
    concept: "SELECT & WHERE Filtering",
    prompt: "In a relational database table `employees`, which SQL clause is used to filter records so that only employees with salary > 50000 are returned?",
    options: [
      "GROUP BY salary > 50000",
      "WHERE salary > 50000",
      "HAVING salary > 50000",
      "FILTER salary > 50000"
    ],
    correctIndex: 1,
    explanation: "The `WHERE` clause filters rows before aggregation. `HAVING` is specifically used for filtering aggregated groups, while `GROUP BY` is for grouping.",
    remedialConcept: "SQL basic row filtering with WHERE"
  },
  {
    id: "sql_201",
    skill: "SQL",
    difficulty: 2,
    type: "scenario",
    concept: "INNER vs LEFT JOIN",
    prompt: "You have two tables: `customers` (100 rows) and `orders` (50 rows from 30 distinct customers). You need a query showing all 100 customers, including those who have made zero orders. Which JOIN must you use?",
    options: [
      "SELECT ... FROM customers INNER JOIN orders ON customers.id = orders.customer_id",
      "SELECT ... FROM customers LEFT JOIN orders ON customers.id = orders.customer_id",
      "SELECT ... FROM customers RIGHT JOIN orders ON customers.id = orders.customer_id",
      "SELECT ... FROM customers CROSS JOIN orders"
    ],
    correctIndex: 1,
    explanation: "A `LEFT JOIN` returns all records from the left table (`customers`), and matched records from the right table (`orders`). Customers without orders will have NULL values for order columns.",
    remedialConcept: "Relational JOIN mechanics (LEFT vs INNER)"
  },
  {
    id: "sql_301",
    skill: "SQL",
    difficulty: 3,
    type: "debugging",
    concept: "Aggregation with GROUP BY & HAVING",
    prompt: "A junior analyst wrote this query to find departments with more than 5 employees whose average salary exceeds $75,000, but it raises a syntax error. What is the bug?\n\n```sql\nSELECT department, COUNT(id) as emp_count, AVG(salary) as avg_sal\nFROM employees\nWHERE COUNT(id) > 5 AND AVG(salary) > 75000\nGROUP BY department;\n```",
    options: [
      "The `AVG` function cannot be used in the SELECT clause with department.",
      "Aggregate conditions (`COUNT` and `AVG`) cannot be in the `WHERE` clause; they belong in a `HAVING` clause.",
      "`department` must also be wrapped in a MAX() function.",
      "The `GROUP BY` clause must appear before the `FROM` clause."
    ],
    correctIndex: 1,
    explanation: "`WHERE` executes before row grouping and cannot evaluate aggregate functions like `COUNT` or `AVG`. Filtering on aggregated groups requires `HAVING COUNT(id) > 5 AND AVG(salary) > 75000` after `GROUP BY`.",
    remedialConcept: "SQL Query Execution Order: WHERE vs HAVING"
  },
  {
    id: "sql_401",
    skill: "SQL",
    difficulty: 4,
    type: "practical",
    concept: "Window Functions (DENSE_RANK vs RANK vs ROW_NUMBER)",
    prompt: "You need to find the 2nd highest salary in each department. If two employees share the top salary ($100k, $100k), the next employee earns $90k. You want $90k to be ranked #2. Which window function should you partition with?",
    options: [
      "ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC)",
      "RANK() OVER (PARTITION BY department ORDER BY salary DESC)",
      "DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC)",
      "NTILE(2) OVER (PARTITION BY department ORDER BY salary DESC)"
    ],
    correctIndex: 2,
    explanation: "`DENSE_RANK()` does not leave gaps in rankings for ties (ranks: 1, 1, 2). `RANK()` would assign (1, 1, 3), skipping 2. `ROW_NUMBER()` assigns distinct consecutive numbers (1, 2, 3) arbitrarily.",
    remedialConcept: "SQL Window Functions and Ranking Tie-breaking"
  },
  {
    id: "sql_501",
    skill: "SQL",
    difficulty: 5,
    type: "scenario",
    concept: "Query Optimization & Indexing",
    prompt: "A query joining a 20-million row `transactions` table with `accounts` on `account_id` takes 45 seconds to run. The execution plan shows a sequential scan on `transactions`. Which strategy best optimizes this in a production Postgres/MySQL database?",
    options: [
      "Create a B-Tree index on `transactions(account_id, transaction_date)` and cluster the table.",
      "Replace the JOIN with a correlated subquery in the SELECT clause.",
      "Wrap the join in a CTE (`WITH temp AS (...)`) to force materialization.",
      "Convert all integer keys to VARCHAR to allow regex hashing."
    ],
    correctIndex: 0,
    explanation: "Creating a composite B-Tree index on `account_id` allows an index scan/merge join instead of a full table scan. Correlated subqueries and VARCHAR conversion degrade performance significantly.",
    remedialConcept: "Database Indexing & Query Execution Plans"
  },

  // --- PYTHON QUESTIONS ---
  {
    id: "py_101",
    skill: "Python",
    difficulty: 1,
    type: "conceptual",
    concept: "Data Types & Mutability",
    prompt: "Which of the following Python data structures is **immutable** (cannot be modified after creation)?",
    options: [
      "list `[1, 2, 3]`",
      "dict `{'a': 1}`",
      "set `{1, 2, 3}`",
      "tuple `(1, 2, 3)`"
    ],
    correctIndex: 3,
    explanation: "Tuples and strings are immutable in Python. Attempting to modify `tuple[0] = 9` will raise a `TypeError`.",
    remedialConcept: "Python primitive types and mutability"
  },
  {
    id: "py_201",
    skill: "Python",
    difficulty: 2,
    type: "debugging",
    concept: "Default Mutable Arguments",
    prompt: "What unexpected behavior occurs when executing this function across multiple calls?\n\n```python\ndef append_item(val, target_list=[]):\n    target_list.append(val)\n    return target_list\n\nprint(append_item(1))\nprint(append_item(2))\n```",
    options: [
      "It raises a SyntaxError because default values cannot be empty lists.",
      "The second call prints `[1, 2]` because default mutable arguments are evaluated only once at function definition time.",
      "The second call prints `[2]` because a fresh list is instantiated on each invocation.",
      "It raises an IndexError on the second call."
    ],
    correctIndex: 1,
    explanation: "In Python, default arguments are evaluated once when the function is defined. The same list object is retained and mutated across subsequent calls. Idiomatic fix: `target_list=None`, then initialize inside.",
    remedialConcept: "Python argument evaluation & default parameter pitfalls"
  },
  {
    id: "py_301",
    skill: "Python",
    difficulty: 3,
    type: "practical",
    concept: "Pandas DataFrame Aggregations & Missing Data",
    prompt: "You have a DataFrame `df` with columns `['category', 'revenue', 'cost']`. You want to calculate the total profit (`revenue - cost`) grouped by `category`, ignoring rows where either `revenue` or `cost` is NaN. What is the most idiomatic pandas expression?",
    options: [
      "df.dropna(subset=['revenue', 'cost']).assign(profit=lambda x: x.revenue - x.cost).groupby('category')['profit'].sum()",
      "for row in df.iterrows(): calculate profit and sum into a python dict",
      "df['profit'] = df['revenue'] - df['cost']; df.dropna().groupby('category').mean()",
      "df.groupby('category').apply(lambda g: (g['revenue'] - g['cost']).dropna().sum())"
    ],
    correctIndex: 0,
    explanation: "Vectorized operations with `.dropna(subset=...)` followed by `.assign()` and `.groupby('category')['profit'].sum()` are memory-efficient, fast, and idiomatic. Iterating with `iterrows()` is slow and unidiomatic.",
    remedialConcept: "Vectorized Pandas operations and chained pipelines"
  },
  {
    id: "py_401",
    skill: "Python",
    difficulty: 4,
    type: "scenario",
    concept: "Generators & Memory Efficiency",
    prompt: "You need to process a 40 GB log file on an analysis machine with only 8 GB of RAM. The task is to filter rows containing the word 'ERROR' and extract IP addresses. How should you structure your Python implementation?",
    options: [
      "Use `with open(filepath) as f: lines = f.readlines()` and process with list comprehension.",
      "Use a generator function yielding parsed entries line by line (`for line in f:`), avoiding loading the entire file into memory.",
      "Use `pickle.load()` to serialize the file in chunks.",
      "Load the file into a NumPy array with `np.fromfile()`."
    ],
    correctIndex: 1,
    explanation: "Iterating directly over a file object in Python utilizes lazy buffering (reading line by line on demand). Using a generator pipeline guarantees O(1) memory consumption regardless of file size.",
    remedialConcept: "Generators, lazy evaluation, and stream processing in Python"
  },
  {
    id: "py_501",
    skill: "Python",
    difficulty: 5,
    type: "debugging",
    concept: "Concurrency, GIL & Multiprocessing",
    prompt: "A data scientist wrote a multithreaded script using `concurrent.futures.ThreadPoolExecutor` to speed up a heavy matrix multiplication calculation across 8 CPU cores. However, the execution takes virtually the same time as a single thread. Why?",
    options: [
      "The Global Interpreter Lock (GIL) in CPython prevents multiple native threads from executing Python bytecodes simultaneously on CPU-bound tasks.",
      "ThreadPoolExecutor is deprecated and only works with async/await coroutines.",
      "Matrix operations in Python must be executed using recursion to trigger multithreading.",
      "CPython limits thread creation to 1 thread per gigabyte of RAM."
    ],
    correctIndex: 0,
    explanation: "Due to CPython's GIL, pure CPU-bound tasks in standard threads cannot achieve parallel multi-core execution. To parallelize CPU-bound workloads, one must use `ProcessPoolExecutor` (multiprocessing) or vectorized C/C++ extensions like NumPy.",
    remedialConcept: "CPython Global Interpreter Lock (GIL) vs Multiprocessing"
  },

  // --- STATISTICS QUESTIONS ---
  {
    id: "stat_101",
    skill: "Statistics",
    difficulty: 1,
    type: "conceptual",
    concept: "Measures of Central Tendency & Outliers",
    prompt: "You are analyzing salary distributions for a company where 95 employees earn between $40k-$60k, but the CEO earns $15,000,000. Which measure of central tendency provides the most realistic representation of a typical employee's salary?",
    options: [
      "Mean",
      "Median",
      "Standard Deviation",
      "Variance"
    ],
    correctIndex: 1,
    explanation: "The median is robust against extreme outliers. In heavily skewed distributions, the mean is pulled artificially high by extreme values, whereas the median reflects the 50th percentile.",
    remedialConcept: "Outlier sensitivity of Mean vs Median"
  },
  {
    id: "stat_201",
    skill: "Statistics",
    difficulty: 2,
    type: "scenario",
    concept: "Hypothesis Testing & p-values",
    prompt: "In an A/B test comparing two website checkout buttons, you set significance level alpha = 0.05. The test results yield a p-value of 0.021. What is the correct statistical conclusion?",
    options: [
      "There is a 2.1% chance that Variant B is better than Variant A.",
      "Reject the null hypothesis; the observed difference in conversion rates is statistically significant at the 5% level.",
      "Accept the null hypothesis because the p-value is less than 0.05.",
      "The conversion rate increased by exactly 2.1%."
    ],
    correctIndex: 1,
    explanation: "Because p-value (0.021) < alpha (0.05), we reject the null hypothesis. There is sufficient evidence to conclude that the difference between the two variants is not due to random chance alone.",
    remedialConcept: "Interpreting p-values and significance thresholds in A/B testing"
  },
  {
    id: "stat_301",
    skill: "Statistics",
    difficulty: 3,
    type: "practical",
    concept: "Correlation vs Causation & Confounding",
    prompt: "A study finds a strong positive correlation (r = 0.88) between municipal ice cream sales and drowning incidents. What is the primary statistical reason you cannot conclude ice cream consumption causes drowning?",
    options: [
      "Pearson's r is only valid for negative relationships.",
      "A lurking/confounding variable (summer temperature / hot weather) drives both ice cream consumption and swimming activity.",
      "The sample size must be greater than 100,000 to determine causation.",
      "Correlation values below 0.90 are considered statistically zero."
    ],
    correctIndex: 1,
    explanation: "Correlation does not imply causation. A third confounding variable (outdoor temperature) causes both variables to rise simultaneously, creating a spurious correlation.",
    remedialConcept: "Confounding variables and spurious correlations"
  },
  {
    id: "stat_401",
    skill: "Statistics",
    difficulty: 4,
    type: "scenario",
    concept: "Type I vs Type II Errors & Statistical Power",
    prompt: "In a medical diagnostic screening for a critical illness, which scenario represents a **Type II Error (False Negative)**, and what is its implication?",
    options: [
      "The test concludes the patient has the illness when they are actually healthy (unnecessary treatment).",
      "The test concludes the patient is healthy when they actually have the illness (missed diagnosis, untreated condition).",
      "The test produces inconclusive results due to contaminated lab equipment.",
      "The test rejects the alternative hypothesis when the null hypothesis is true."
    ],
    correctIndex: 1,
    explanation: "A Type II error (beta) is failing to reject a false null hypothesis—in this case, failing to detect the disease when it is present (False Negative). In critical diagnostics, reducing Type II errors is prioritized.",
    remedialConcept: "Type I (False Positive) vs Type II (False Negative) errors"
  },

  // --- DATA VISUALIZATION / POWER BI ---
  {
    id: "viz_101",
    skill: "Data Visualization",
    difficulty: 1,
    type: "conceptual",
    concept: "Chart Selection Principles",
    prompt: "Which chart type is most appropriate to display the trend of monthly revenue over a consecutive 3-year period?",
    options: [
      "Pie chart with 36 slices",
      "Line chart with time on the X-axis and revenue on the Y-axis",
      "Scatter plot without connecting lines",
      "Treemap with nested blocks"
    ],
    correctIndex: 1,
    explanation: "Line charts are designed for continuous time-series data to show trajectory, seasonality, and slope over time. Pie charts with >5 slices are unreadable.",
    remedialConcept: "Chart selection: Time-series vs Proportions"
  },
  {
    id: "pbi_201",
    skill: "Power BI",
    difficulty: 2,
    type: "scenario",
    concept: "Star Schema vs Snowflake Schema",
    prompt: "When designing a data model for reporting in Power BI, why is a **Star Schema** with dimension and fact tables preferred over a single giant flat table?",
    options: [
      "Power BI's VertiPaq storage engine is optimized for star schemas, improving compression, filter propagation, and DAX measure performance.",
      "Power BI cannot import flat tables containing more than 5 columns.",
      "Star schemas eliminate the need for relationships.",
      "DAX formulas can only reference dimension tables."
    ],
    correctIndex: 0,
    explanation: "Star schemas optimize the VertiPaq engine's column store compression and relationship traversal. Flat tables cause redundant cardinality and slower cross-filtering.",
    remedialConcept: "Dimensional Modeling & Star Schemas in Power BI"
  }
];

const ROLE_PROJECTS = {
  "Data Analyst": [
    {
      id: "da_proj_1",
      tier: "Beginner",
      title: "E-Commerce Customer & Sales Data Cleaning",
      objective: "Clean and standardize an uncurated transactional dataset of 10,000 orders to prepare it for management reporting.",
      dataset_requirements: "Raw CSV with missing customer emails, negative order quantities, irregular date formats (MM/DD/YY vs YYYY-MM-DD), and duplicate IDs.",
      tasks: [
        "Detect and resolve negative order quantities by cross-referencing return status codes.",
        "Impute or isolate missing customer identifiers without losing aggregate revenue totals.",
        "Standardize all date strings into ISO 8601 (`YYYY-MM-DD`) format.",
        "Generate a cleaned summary table showing total sales by product category."
      ],
      expected_output: "Cleaned dataset with zero duplicate transaction IDs, formatted dates, and a markdown summary of anomaly handling.",
      skills_tested: ["Data Cleaning", "Python", "Excel"],
      difficulty: 2,
      evaluation_criteria: [
        "Data hygiene & integrity preservation",
        "Correct handling of edge cases and missing values",
        "Code modularity and documentation"
      ],
      sample_solution_keywords: ["dropna", "fillna", "to_datetime", "duplicated", "groupby"]
    },
    {
      id: "da_proj_2",
      tier: "Intermediate",
      title: "Subscription Retention & Churn Analysis",
      objective: "Analyze customer cohort retention rates and identify key behavioral drivers of churn over 12 months.",
      dataset_requirements: "User activity logs, billing renewal records, and customer support ticket counts.",
      tasks: [
        "Construct a monthly retention cohort matrix using SQL / Pandas.",
        "Calculate Churn Rate, Customer Lifetime Value (LTV), and Average Revenue Per User (ARPU).",
        "Perform statistical significance testing comparing churn rates between users who contacted support vs those who did not.",
        "Create an executive chart showing retention curve decay by acquisition channel."
      ],
      expected_output: "Cohort heatmap visualization, SQL query file with window functions, and an executive briefing memo.",
      skills_tested: ["SQL", "Statistics", "Data Visualization", "Business Analysis"],
      difficulty: 3,
      evaluation_criteria: [
        "Statistical correctness of cohort calculations",
        "Insight depth: identifying root cause rather than merely restating numbers",
        "Visual clarity and executive communication"
      ],
      sample_solution_keywords: ["cohort", "retention", "window function", "p-value", "churn rate"]
    },
    {
      id: "da_proj_3",
      tier: "Advanced",
      title: "End-to-End Enterprise BI & Forecasting Dashboard",
      objective: "Build an automated business intelligence solution connecting SQL database transactions to an interactive Power BI dashboard with sales forecasting.",
      dataset_requirements: "Relational multi-table ERP database (Orders, Customers, Products, Regional Targets).",
      tasks: [
        "Design a Star Schema data model with optimized relationships and 1-to-many cardinality.",
        "Write custom DAX measures for Year-over-Year (YoY) Growth, Moving Average Sales, and Target Variance.",
        "Implement a time-series forecast model predicting next quarter demand with confidence intervals.",
        "Configure Row-Level Security (RLS) and interactive drill-through pages for regional managers."
      ],
      expected_output: "Deployable Power BI report template (.pbix specification) or interactive web dashboard with documented DAX logic.",
      skills_tested: ["Power BI", "SQL", "Statistics", "Data Visualization", "Business Analysis"],
      difficulty: 4,
      evaluation_criteria: [
        "Data model architecture (star schema optimization)",
        "DAX measure computational efficiency",
        "User experience, visual hierarchy, and actionable business levers"
      ],
      sample_solution_keywords: ["CALCULATE", "SAMEPERIODLASTYEAR", "star schema", "forecast", "DAX"]
    }
  ],
  "AI / Machine Learning Engineer": [
    {
      id: "mle_proj_1",
      tier: "Beginner",
      title: "Customer Credit Risk Classification Pipeline",
      objective: "Build an end-to-end scikit-learn binary classification pipeline predicting loan default risk while preventing data leakage.",
      dataset_requirements: "Tabular credit records with imbalanced classes, categorical variables, and numerical features.",
      tasks: [
        "Implement proper train/validation/test split before applying feature scaling and categorical encoding.",
        "Address class imbalance using SMOTE or cost-sensitive class weighting.",
        "Train and compare Logistic Regression, Random Forest, and XGBoost models using cross-validation.",
        "Evaluate using ROC-AUC, Precision-Recall AUC, and confusion matrix rather than raw accuracy."
      ],
      expected_output: "Python script/notebook with scikit-learn `Pipeline`, serialized model artifact, and evaluation report.",
      skills_tested: ["Python", "Machine Learning Algorithms", "Data Preprocessing"],
      difficulty: 3,
      evaluation_criteria: [
        "Strict prevention of data leakage between folds",
        "Justification of metric choice for imbalanced data",
        "Interpretability (feature importances / SHAP values)"
      ],
      sample_solution_keywords: ["Pipeline", "ColumnTransformer", "roc_auc_score", "cross_val_score", "class_weight"]
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ROLE_COMPETENCY_MAPS,
    DIAGNOSTIC_QUESTION_BANK,
    ROLE_PROJECTS
  };
} else {
  window.ROLE_COMPETENCY_MAPS = ROLE_COMPETENCY_MAPS;
  window.DIAGNOSTIC_QUESTION_BANK = DIAGNOSTIC_QUESTION_BANK;
  window.ROLE_PROJECTS = ROLE_PROJECTS;
}
