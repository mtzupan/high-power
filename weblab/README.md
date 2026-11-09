# Web Lab: Turbine Data Lab

A Code.org [Web Lab](https://code.org/en-US/tools/web-lab) version of the Colab loops-and-lists
exercises in `notebooks/instrumentation_day1_revB.ipynb`. It's written in plain HTML, CSS and JavaScript, with
no build step and no outside libraries, because Web Lab limits imports.

## Layout

```
weblab/
├── csv_to_datajs.py   # turns readings CSVs into a project's data.js (run on your Mac)
├── solution/
│   └── script.js      # teacher answer key for day1-class: every step uncommented
├── day1-class/        # whole class, first day of the lesson
├── blade/             # blade specialist group
├── generator/         # generator specialist group
└── gears/             # gears specialist group
```

Each of the four project folders holds the same six files, and that folder's six files are
what goes into one Web Lab project:

```
<project>/
├── index.html     # page layout (students don't edit)
├── style.css      # styling (students don't edit)
├── data.js        # generated readings (don't edit by hand)
├── chart.js       # canvas line-chart helper (students don't edit)
├── script.js      # THE STUDENT FILE: uncomment lines step by step
└── page.js        # shows step status, charts and table (students don't edit)
```

The group folders start as copies of `day1-class` and are meant to diverge.

Students only work in `script.js`. It follows the notebook: build parallel lists with a
`for` loop, calculate power, find spin-up time with a `while` loop, and average the
steady-state current.

## Updating the data

The readings are written as a JavaScript list so the project works even if Web Lab can't
upload or `fetch()` CSV files. After a new collection:

```bash
python3 weblab/csv_to_datajs.py notebooks/datasets/IMG_8355_readings.csv
```

That writes `day1-class/data.js`. Use `-o` to fill a group's project instead:

```bash
python3 weblab/csv_to_datajs.py notebooks/datasets/IMG_8355_readings.csv -o weblab/blade/data.js
```

You can pass several CSVs, for example to compare taper and rectangle blades. The first one becomes
`readings`, and every one is available as `datasets["<file name>"]`. Blank CSV cells
become `null`.

## Trying it locally

Open any project's `index.html` (for example `day1-class/index.html`) in a browser. If it works there with no network, it should work in
Web Lab.

## Before class: check these in Web Lab

These aren't covered in Code.org's public docs, so test them in a real project:

- [ ] Create a blank project at studio.code.org/projects/weblab2/new and add all six files
      (or paste their contents into new files).
- [ ] Is there a size limit on `data.js` after several datasets are added?
- [ ] Share the project: can students in a section **remix** it into their own copy?
- [ ] AI Tutor: verify your teacher account and turn it on for the section.
- [ ] LAUSD Chromebooks: can students reach studio.code.org and sign in?
