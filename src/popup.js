// Declare references to elements in popup.html
var scanPageBtn = document.getElementById('scanPageBtn');
var applyFormatBtn = document.getElementById('applyFormatBtn');
var resetPageBtn = document.getElementById('resetPageBtn');

var pageTypeCheckValue = document.getElementById('pageTypeCheckValue');
var questionCountValue = document.getElementById('questionCountValue');
var sbqCountValue = document.getElementById('sbqCountValue');
var gbqCountValue = document.getElementById('gbqCountValue');

// Runs scanPage content script when scanPageBtn is pressed
scanPageBtn.addEventListener('click', async() => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      function: scanPage,
    });
});

// Runs applyFormat content script when applyFormatBtn is pressed, and stores related options
applyFormatBtn.addEventListener('click', async() => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    let options = [
      document.getElementById('displayCorrectAnsCheckbox').checked,
      document.getElementById('displayTeamAnsCheckbox').checked,
      document.getElementById('displaySBQCheckbox').checked,
      document.getElementById('displayGBQCheckbox').checked,
      document.getElementById('displayBQLikesCheckbox').checked,
      document.getElementById('displayBQTeamCheckbox').checked,
      document.getElementById('appendTemplateCheckbox').checked,
      document.getElementById('replaceImagesCheckbox').checked
    ];
  
    chrome.storage.local.set({options: options}, function() {
      console.log('Options are set as follows: '+ options)
    })

    chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      function: applyFormat,
    });

});

// Reloads page when resetPageBtn is pressed
resetPageBtn.addEventListener('click', async() => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.reload();
});

// Listens for messages sent by either content script
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // Receives scanPage data
    if (request.message[0] == 'scanPage') {
      pageTypeCheckValue.innerHTML = request.message[1];
      questionCountValue.innerHTML = request.message[2];
      sbqCountValue.innerHTML = request.message[3];
      gbqCountValue.innerHTML = request.message[4];
      chrome.storage.local.set({pageType: request.message[1]}, function() {
        console.log('pageType detected as '+ request.message[1]);
      });
      sendResponse({answer: 'Page Data Received Successfully'});
    }
    // Sends scanPage and options data to applyFormat on request
    if (request.message[0] == 'applyFormat') {
      chrome.storage.local.get([
        'pageType',
        'options'
      ], function(result) {
        sendResponse({pageType: result.pageType, options: result.options});
      })
    }
    // Enable synchronous operation
    return true;
  }
);

function scanPage() {
  // Declare Output Variables, a list of which will be returned
  let pageTypeCheck;
  let questionCount;
  let sbqCount;
  let gbqCount;
  // Declare intermediate variables for pageTypeCheck
  let title = document.getElementsByTagName('title')[0].innerHTML;
  let traCheck = !!document.getElementById('toggle-burning-questions-button');
  let aeCheck = !!document.getElementsByName('FinishButton');
  let bqCount;
  
  if (title == 'Scratchie' && traCheck == true) {

    pageTypeCheck = 'iRA/tRA';
    let traQuestionContainer = document.getElementsByClassName('panel-body panel-learner-body')[0];
    let traQuestions = traQuestionContainer.getElementsByClassName('panel-body-sm');
    questionCount = traQuestions.length;
    bqCount = document.getElementsByClassName("jqgrow ui-row-ltr").length;
    gbqContainer = document.getElementById("burningQuestions0");
    if (gbqContainer != null) {
      gbqCount = gbqContainer.getElementsByClassName("jqgrow ui-row-ltr").length;
    } else {
      gbqCount = 0;
    }
    sbqCount = bqCount-gbqCount;

  } else if (title == 'Assessment' && aeCheck == true) {

    pageTypeCheck = 'AE';
    let aeQuestionContainer = document.getElementsByClassName('form-group')[0];
    let aeQuestions = aeQuestionContainer.getElementsByClassName('panel panel-default');
    questionCount = aeQuestions.length;
    sbqCount = "NA";
    gbqCount = "NA";

  } else {

    pageTypeCheck = 'Unsupported'
    questionCount = 'NA'
    sbqCount = 'NA'
    gbqCount = 'NA'

  }

  chrome.runtime.sendMessage({message: ['scanPage', pageTypeCheck, questionCount, sbqCount, gbqCount]}, function(response) {
    console.log(response.answer);
  });
  return 0;
}

function applyFormat() {
  chrome.runtime.sendMessage({message: ['applyFormat', 0]}, function(response) {
    let pageType = response.pageType;
    let options = response.options
    // Change page header
    document.getElementsByClassName('panel-title panel-learner-title')[0].innerHTML = pageType;

    // HTML for template element
    var templateHTML = `
                <br>
                <span>Team Ans:</span>
                <ul><li></li></ul>
                <br>
                <span>CE Ans:</span>
                <ul><li></li></ul>
              `;

    // Common Changes
    // Remove head elements (especially CSS and scripts)
    head = document.getElementsByTagName('head')[0];
    head_array = Array.prototype.slice.call(head.childNodes);
    for (let i = 0; i < head_array.length; i++) {
      head_array[i].remove();
    }
    // Remove sidebar, if present
    let nav = document.getElementsByTagName('nav');
    if (!!nav == true) {
      nav[0].remove();
    }
    // Remove all other scripts
    var scripts_array = Array.prototype.slice.call(document.getElementsByTagName('script'));
    for (let i = 0; i < scripts_array.length; i++) {
      scripts_array[i].remove();
    }
    // Remove all btns (especially the 'Next Activity' and 'Finish' buttons at the bottom of the page)
    var btns_array = Array.prototype.slice.call(document.getElementsByClassName('btn'));
    for (let i = 0; i < btns_array.length; i++) {
      btns_array[i].remove();
    }
    // Remove empty .panel-title elements
    var panel_title_array = Array.prototype.slice.call(document.getElementsByClassName('panel-title'));
    for (let i = 0; i < panel_title_array.length; i++) {
      if (!/\S/.test(panel_title_array[i].innerHTML)) {
        panel_title_array[i].remove();
      }
    }
    // Add line break to end of page
    var end = document.createElement('span');
    end.innerHTML = '&nbsp'
    document.getElementById('navcontent').appendChild(end);

    // Remove MOSH widget
    document.getElementById('discussion-sentiment-command').remove();
    document.getElementById('discussion-sentiment-widget').remove();

    // Inject new css into head
    var style = document.createElement('style');
    style.innerHTML = `
      body {
        font-family: Arial, sans-serif;
        font-size: 11pt;
      }

      .panel-title.panel-learner-title {
        font-weight: bold;
      }

      .lead {
        font-weight: bold;
        text-decoration: underline;
      }

      table {
        text-align: left;
        width: 100%;
        border-spacing: 0;
        margin: 0;
        padding: 0;
        border: 0;
      }

      td:first-child {
        width: 100%;
      }

      td {
        padding: 0px;
      }

      th {
        font-weight: normal;
        text-decoration: underline;
      }

      .injected-bq-table > tbody > tr > td {
        padding-bottom: 1em;
      }

      .injected-bq-header {
        text-decoration: underline;
      }

      .injected-bq {
        font-style: italic;
      }

      ul {
        margin-block-start: 0;
        margin-block-end: 0;
      }
    `;
    head.appendChild(style);

    // HIGHLY EXPERIMENTAL: Get image data and re-render in canvas to allow direct copying to gdoc
    /// Helper function
    function urlContentToDataUri(url){
      return  fetch(url)
              .then( response => response.blob() )
              .then( blob => new Promise( callback =>{
                  let reader = new FileReader() ;
                  reader.onload = function(){ callback(this.result) } ;
                  reader.readAsDataURL(blob) ;
              }) ) ;
    }

    /// Main loop
    if (options[7] == true) {
      var img_array = Array.prototype.slice.call(document.getElementsByClassName("img-responsive"));
      var new_img;
      for (let i = 0; i < img_array.length; i++) {
        urlContentToDataUri(img_array[i].src).then( dataUri => {
          new_img = document.createElement("img");
          new_img.src = dataUri;
          img_array[i].parentNode.insertBefore(new_img, img_array[i]);
          img_array[i].remove();
        });
      }
    }

    if (pageType == 'iRA/tRA') {
      // If "Display correct answers" is ticked
      // Define the main question container
      var questionContainer = document.getElementsByClassName("panel-body panel-learner-body")[0];
      if (options[0] == true) {
        // I HATE LAMS but this finds all MCQ answers which have a check displayed to their left, then applies a bold style to the parent row
        var scratchie_image_array = Array.prototype.slice.call(document.getElementsByClassName("scartchie-image"))
        var correct_ans;
        var correct_ans_container;
        for (let i = 0; i < scratchie_image_array.length; i++) {
          if(scratchie_image_array[i].getAttribute("src").includes("scratchie-correct.png")) {
            correct_ans_container = document.createElement("span");
            correct_ans = scratchie_image_array[i].parentElement.parentElement.getElementsByClassName("answer-description")[0];
            correct_ans.setAttribute("style", "font-weight: bold;");
          }
        }
      }
      // Remove scores
      document.getElementById('score').remove();
      var item_score_array = Array.prototype.slice.call(document.getElementsByClassName('item-score'));
      for (let i = 0; i < item_score_array.length; i++) {
        item_score_array[i].remove();
      }
      // Remove all confidence levels
      var chosenAnswers = document.getElementsByClassName('answer-with-confidence-level-portrait')
      var chosenAnswersChildren
      for (let i = 0; i < chosenAnswers.length; i++) {
        chosenAnswersChildren = Array.prototype.slice.call(chosenAnswers[i].children);
        for (let j = 0; j < chosenAnswersChildren.length; j++) {
          if (chosenAnswersChildren[j].className != 'answer-description') {
            chosenAnswersChildren[j].remove()
          }
        }
      }
      // Remove all the grey MCQ answer labels and MCQs associated table structure
      var mcqtable_array=Array.prototype.slice.call(document.getElementsByClassName('table table-hover scratches'));
      var mcqoptions;
      var mcqoption;
      var mcqdiv;

      for (let i = 0; i < mcqtable_array.length; i++) {
        mcqdiv = document.createElement('div');
        mcqdiv.appendChild(document.createElement('br'));
        mcqdiv.setAttribute("class", "injected-mcq-div");
        mcqoptions = Array.prototype.slice.call(mcqtable_array[i].getElementsByTagName('tr'));
        for (let j = 0; j < mcqoptions.length; j++) {
          mcqoption = document.createElement('div');
          mcqoption.innerHTML = mcqoptions[j].getElementsByTagName('td')[1].innerHTML;
          mcqdiv.appendChild(mcqoption);
        }
        questionContainer.insertBefore(mcqdiv, mcqtable_array[i]);
        mcqtable_array[i].remove();
      }
      
      // Find and reformat burning questions; i went slightly mad here
      // For each bq_block
      var bq_block_array = Array.prototype.slice.call(document.getElementsByClassName('burning-question-dto'))
      var bq_no;
      var q_no;
      var bqs_row;
      var bqs_cell;

      var bq_grp_name_arr = [];
      var bq_text_arr = [];
      var bq_like_count_arr = [];

      var tbl;
      var tblBody;
      var row;
      var grpCell;
      var textCell;
      var likeCell;

      var container;
      var header;
      var bq;

      for (let i = 0; i < bq_block_array.length; i++) {
        // Find the corresponding question title, unless it is the GBQ block
        bq_title = bq_block_array[i].getElementsByClassName("bq-title");
        if (bq_title.length > 0) {
          bq_no = bq_title[0].innerHTML;
          bq_no = bq_no.replace(/\D/g,'');
          q_no = 'questionTitle'+bq_no;
        } else {
          q_no = 'generalBQ';
        }
        
        // Store properties of the block's BQs in array form
        bqs_row = bq_block_array[i].getElementsByClassName("jqgrow ui-row-ltr")
        for (let j = 0; j < bqs_row.length; j++) {
          bqs_cell = bqs_row[j].getElementsByTagName("td");
          for (let k = 0; k < bqs_cell.length; k++) {
            if (bqs_cell[k].getAttribute("aria-describedby").includes("_groupName")) {
              bq_grp_name_arr.push(bqs_cell[k].innerHTML);
            } else if (bqs_cell[k].getAttribute("aria-describedby").includes("_burningQuestion")) {
              bq_text_arr.push(bqs_cell[k].innerHTML);
            } else if (bqs_cell[k].getAttribute("aria-describedby").includes("_count")) {
              bq_like_count_arr.push(bqs_cell[k].innerHTML);
            }
          }
        }

        if (options[4] == false & options[5] == false) {
          container = document.createElement('div');
          container.setAttribute("class", "injected-bq-div");
          container.appendChild(document.createElement('br'));
          header = document.createElement('span');
          header.setAttribute("class", "injected-bq-header");

          if (q_no == "generalBQ") {header.innerHTML = "General Burning Questions";} 
          else {header.innerHTML = "Burning Questions";}
          container.appendChild(header);

          for (let i = 0; i < bq_text_arr.length; i++) {
            container.appendChild(document.createElement('br'));
            bq = document.createElement('div');
            bq.innerHTML = bq_text_arr[i];
            bq.setAttribute("class", "injected-bq");
            container.appendChild(bq);
            if (options[6] == true) {
              template = document.createElement('div');
              template.innerHTML = templateHTML;
              container.appendChild(template);
            }
          }

          // Inserts generated div back into the document
          if (q_no == "generalBQ" & options[3] == true) {
            // Insert gbqs if option is selected
            questionContainer.appendChild(container);
          } else if (q_no != "generalBQ" & options[2] == true) {
            // Insert sbqs if option is selected
            // Imma pick a fight with the lams web design team
            questionContainer.insertBefore(container, document.getElementById(q_no).nextElementSibling.nextElementSibling.nextElementSibling);
          } else {
            // Does nothing if options are deselected
          }

        } else {
          // Creates a fresh table for the block's BQs from array data
          tbl = document.createElement('table');
          tblBody = document.createElement('tbody');
          // Create header row for table
          row = document.createElement("tr");
          textCell = document.createElement("th");
          if (q_no == "generalBQ") {textCell.innerHTML = "General Burning Questions";} 
          else {textCell.innerHTML = "Burning Questions";}
          row.appendChild(textCell);
          if (options[4] == true) {
            likeCell = document.createElement("th");
            likeCell.innerHTML = "Likes";
            row.appendChild(likeCell);
          } else {}
          if (options[5] == true) {
            grpCell = document.createElement("th");
            grpCell.innerHTML = "Team";
            row.appendChild(grpCell);
          } else {}
          tblBody.appendChild(row);
          // Create rows from array
          for (let i = 0; i < bq_text_arr.length; i++) {
            row = document.createElement("tr");
            textCell = document.createElement("td");
            textCell.innerHTML = bq_text_arr[i];
            row.appendChild(textCell);
            if (options[4] == true) {
              likeCell = document.createElement("td");
              likeCell.innerHTML = bq_like_count_arr[i]
              row.appendChild(likeCell);
            } else {}
            if (options[5] == true) {
              grpCell = document.createElement("td");
              grpCell.innerHTML = bq_grp_name_arr[i];
              row.appendChild(grpCell);
            } else {}
            tblBody.appendChild(row);
          }
          tbl.appendChild(tblBody);
          tbl.setAttribute("class", "injected-bq-table");

          // Inserts generated table back into the document
          if (q_no == "generalBQ" & options[3] == true) {
            // Insert gbqs if option is selected
            questionContainer.appendChild(tbl);
          } else if (q_no != "generalBQ" & options[2] == true) {
            // Insert sbqs if option is selected
            // Imma pick a fight with the lams web design team
            questionContainer.insertBefore(tbl, document.getElementById(q_no).nextElementSibling.nextElementSibling.nextElementSibling);
          } else {
            // Does nothing if options are deselected
          }
        }

        // Wipe our arrays
        bq_grp_name_arr=[];
        bq_text_arr=[];
        bq_like_count_arr=[];

        // Delete the original table
        bq_block_array[i].remove();
      }
      // Clear remnants of the BQ container
      document.getElementsByClassName("voffset5")[0].remove();
      // Inject line spacing before questions, BQs, and choices
      questions = questionContainer.getElementsByClassName("lead");
      for (let i = 0; i < questions.length; i++) {
        questionContainer.insertBefore(document.createElement('br'), questions[i]);
      }
      burning_questions = document.getElementsByClassName("injected-bq-table");
      for (let i = 0; i < burning_questions.length; i++) {
        questionContainer.insertBefore(document.createElement('br'), burning_questions[i]);
      }
      choices = questionContainer.getElementsByClassName("table table-hover scratches");
      for (let i = 0; i < choices.length; i++) {
        questionContainer.insertBefore(document.createElement('br'),choices[i]);
      }
      // Reformat question numbers
      for (let i = 0; i < questions.length; i++) {
        q_no = questions[i].innerHTML.replace(/\D/g,'');
        q_label = "Question "+q_no;
        questions[i].innerHTML = q_label;
      }

    } else if (pageType == 'AE') {
      // Remove leader
      document.getElementsByClassName('leader-display')[0].remove();
      // Remove all radio buttons and invisible spacer elements
      var table_radio_array = Array.prototype.slice.call(document.getElementsByClassName('has-radio-button'));
      for (let i = 0; i < table_radio_array.length; i++) {
        table_radio_array[i].remove();
      }
      var table_spacer_array = Array.prototype.slice.call(document.getElementsByClassName('complete-item-gif'));
      for (let i = 0; i < table_spacer_array.length; i++) {
        table_spacer_array[i].remove();
      }
      // Remove team answers if option is selected, otherwise reformat team answer table
      var table_grps_array = Array.prototype.slice.call(document.getElementsByClassName('selected-by-groups'));
      if (options[1] == true) {
        for (let i = 0; i < table_grps_array.length; i++) {
          table_grps_array[i].children[1].remove();
          table_grps_array[i].children[0].remove();
        }
      } else {
        for (let i = 0; i < table_grps_array.length; i++) {
          table_grps_array[i].remove()
        }
        var question_type_array = Array.prototype.slice.call(document.getElementsByClassName('question-type'))
        var question_children;
        for (let i = 0; i < question_type_array.length; i++) {
          if (question_type_array[i].innerHTML.includes("Answer:")) {
            question_children = Array.prototype.slice.call(question_type_array[i].parentElement.children);
            for (let j = 0; j < question_children.length; j++) {
              question_children[j].remove();
            }
          }
        } 
      }
      // Remove team portraits
      var portraits_array = Array.prototype.slice.call(document.getElementsByClassName('portrait-sm portrait-round'));
      for (let i = 0; i < portraits_array.length; i++) {
        portraits_array[i].remove();
      }
      // Insert line breaks between questions, question types, and choices
      // Check needed due to Jan 2022 change in LAMS AE page structure
      if (document.getElementById("answers") != null) {
        var question_container = document.getElementById("answers");
      } else {
        var question_container = document.getElementsByClassName("form-group")[0];
      }
      var questions = question_container.getElementsByClassName("panel panel-default");
      var question_body;
      for (let i = 0; i < questions.length; i++) {
        question_container.insertBefore(document.createElement('br'), questions[i]);
        question_body = questions[i].getElementsByClassName('panel-body')[0];
        if (question_body.getElementsByClassName('question-type')[0] != undefined) {
          question_body.insertBefore(document.createElement('br'), question_body.getElementsByClassName('question-type')[0]);
        }
        if (question_body.getElementsByClassName('table-responsive')[0] != undefined) {
          question_body.insertBefore(document.createElement('br'), question_body.getElementsByClassName('table-responsive')[0]);
        }
        // Add transcription templates if required
        if (options[6] == true) {
          template = document.createElement('div');
          template.innerHTML = templateHTML;
          question_body.appendChild(template);
        }
      }
      // Remove extraneous line break at top
      question_container.getElementsByTagName('br')[0].remove();

      // Remove MCQ associated table structure
      var mcqtable_array=Array.prototype.slice.call(document.getElementsByClassName('table table-hover table-condensed'));
      var mcqoptions;
      var mcqoption;
      var mcqdiv;

      for (let i = 0; i < mcqtable_array.length; i++) {
        mcqdiv = document.createElement('div');
        mcqdiv.setAttribute("class", "injected-mcq-div");
        mcqoptions = Array.prototype.slice.call(mcqtable_array[i].getElementsByTagName('td'));
        for (let j = 0; j < mcqoptions.length; j++) {
          mcqoption = document.createElement('div');
          mcqoption.innerHTML = mcqoptions[j].innerHTML;
          mcqdiv.appendChild(mcqoption);
        }
        mcqtable_array[i].parentElement.appendChild(mcqdiv);
        mcqtable_array[i].remove();
      }

      // Remove rationales
      var init_rationale_array = Array.prototype.slice.call(document.getElementsByClassName('question-type'));
      var rationale_array = [];

      for (let i = 0; i < init_rationale_array.length; i++) {
        if (init_rationale_array[i].innerText == "Rationale") {
          rationale_array.push(init_rationale_array[i]);
        }
      }

      for (let i = 0; i < rationale_array.length; i++) {
        rationale_array[i].nextElementSibling.remove();
        rationale_array[i].remove();
      }
    } else {
      return;
    }
  })
}