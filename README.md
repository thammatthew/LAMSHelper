# TBLHelper

A chrome extension to facilitate TBL transcription by extracting relevant data from LAMS pages. 

Supports parsing of data from the following page types:

- iRA/tRAs
  - Questions including images
  - Answers
  - Specific & General Burning Questions (including associated Like Count and Team data)
- AEs
  - Questions including images
  - Team answers

## Download

1. Click the most recent version under 'Releases' on the right of this page
2. Download the attached zip file

## Installation

1. Unzip the downloaded file into a folder anywhere on your computer

2. Open Chrome and type in 'chrome://extensions' in the address bar, then hit enter

3. Enable 'Developer mode' by turning on the toggle on the top right

4. Click the 'Load unpacked' button on the top left, and select the folder created in Step 1

   ![](https://github.com/thammatthew/TBLHelper/blob/main/readme_images/Installation1.png)

5. Press the extensions button (puzzle piece) on the right of the address bar

6. In the popup that appears, find the extension named TBL Helper and hit the pin icon

   ![Installation2](https://github.com/thammatthew/TBLHelper/blob/main/readme_images/Installation2.png)

## Instructions

1. On a LAMS iRA/tRA page (once answers and burning questions have been revealed) or on an AE page, click the purple extension icon to open the extension popup

   ![Instructions1](https://github.com/thammatthew/TBLHelper/blob/main/readme_images/Instructions1.png)

2. Press the 'SCAN PAGE' button on the bottom left of the popup to parse the page. Information retrieved from the page should now be displayed in the table on the left

   ![Instructions2](https://github.com/thammatthew/TBLHelper/blob/main/readme_images/Instructions2.png)

3. If required, change the export format by ticking/unticking the checkboxes on the right. Recommended settings for TBL transcription are as follows:

   - For AEs,
     - Leave all boxes unchecked
   - For iRA/tRAs,
     - For questions only,
       - Leave all boxes unchecked
     - For questions and answers as well as burning questions,
       - Check 'Display correct answers'
       - Check 'Display specific burning questions'
       - Check 'Display general burning questions'

4. Press the 'APPLY' button on the bottom right to apply the format to the page

   ![Instructions3](https://github.com/thammatthew/TBLHelper/blob/main/readme_images/Instructions3.png)

5. To save the formatted page,

   1. Hit Ctrl/Cmd+P, or right click anywhere on the page and click 'Print'

      **NOTE:** Do not click 'Save as' and save the page as HTML

   2. Change 'Destination' to 'Save as PDF'

   3. Press the 'SAVE' button on the bottom of the popup

      ![Instructions4](https://github.com/thammatthew/TBLHelper/blob/main/readme_images/Instructions4.png)

   4. Open the saved PDF in Microsoft Word, and save it as a .DOCX

      **NOTE:** This step is required to avoid odd quirks in the Google Docs PDF converter

   5. Upload the .DOCX to Google Drive, and open in Google Docs

6. To reformat the page with different options,

   1. Open the extension again
   2. Press the 'RESET PAGE' button on the bottom right
   3. Return to Step 1

## Credits

- Written by [Matthew Tham](mailto:matthewtham2002@gmail.com) (Batch of 2026)
- Inspired by the TBLFinder program written by Kuan Yang (Batch of 2025)