```
high-power/
├── README.md
├── LICENSE
├── folder-structure.md
├── backend/
│   ├── .gitignore
│   ├── alembic.ini
│   ├── high_power.db
│   ├── pyproject.toml
│   ├── requirements.txt
│   ├── alembic/
│   │   ├── README
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   │       └── 22030ecf5f08_create_turbine_table.py
│   └── app/
│       ├── __init__.py
│       ├── config.py
│       ├── database.py
│       ├── main.py
│       ├── models/
│       │   ├── __init__.py
│       │   └── turbine.py
│       ├── routers/
│       │   ├── __init__.py
│       │   └── turbine.py
│       ├── schemas/
│       │   ├── __init__.py
│       │   └── turbine.py
│       └── services/
│           ├── __init__.py
│           └── turbine.py
└── frontend/
    ├── .gitignore
    ├── next.config.ts
    ├── package.json
    ├── package-lock.json
    ├── postcss.config.mjs
    ├── tsconfig.json
    ├── public/
    └── src/
        └── app/
            ├── globals.css
            ├── layout.tsx
            └── page.tsx
```
