# IMG_8355_readings.csv

## Prompt

## Response
File: ../../project/10 - Testing and Validation

This video doesn’t contain voltage readings. The multimeter is set to measure current (DC current, shown in µA and then mA) for the whole clip. So this is the video from step 6, not step 4. The CSV has the current and Hz columns filled in and the voltage column left empty, which is the opposite of what you expected. If you have the step 4 voltage video, send it and I’ll fill in the voltage column.

How I read it: ffmpeg wasn’t installed, so I used the Mac’s built-in video framework to grab one frame per second (35 frames, about 34 s of video). I cropped out the tachometer and multimeter screens and read each value by eye, without OCR (automatic text recognition). Current is in mA throughout; the early µA readings are converted.

What the data shows:

0–8 s: the turbine is still. Current is about 0 µA and the tachometer reads 0.0 Hz.
9–11 s: the multimeter shows “overload” while it switches ranges as current rises. Those current cells are blank.
12–15 s: spin-up, from 41.7 mA at 1.5 Hz to 50.4 mA at 2.8 Hz.
16–34 s (steady state): current averages about 52.6 mA (range 51.8–53.2 mA) at about 2.9 Hz (it moves between 2.9 and 3.0).
31–32 s: the tachometer screen was caught mid-change and can’t be read, so those Hz cells are blank. Each gap is noted in a notes column.

I also added a time_s column so the step 4 and step 6 readings can be lined up by time.