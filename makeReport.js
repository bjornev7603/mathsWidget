export default class makeReport {
  constructor(answers = null) {
    //jsonify: add "[" and "]" to start and end, strip "," to end
    answers = "[" + answers.slice(0, -1) + "]";

    this.time_data = [];
    this.points_data = [];
    this.selected_el_data = [];

    answers = JSON.parse(answers);

    let time_first = 0,
      time_last = 0,
      time_diff = 0;

    let tasks = groupArrayMain(answers, "svgfile", "a_file");
    tasks = JSON.parse(tasks);

    //loop TASKS
    for (var task_key in tasks) {
      let task = tasks[task_key];
      let taskname = task.svgfile;
      this.time_data[taskname] = [];
      this.points_data[taskname] = [];
      this.selected_el_data[taskname] = [];

      //loop ATTEMPTS at each task
      for (var att_key in task.svgfile_group) {
        let attempt = task.svgfile_group[att_key];
        let attemptname = attempt.a_file;
        let sel_points = null;
        let sel_el = null;

        time_first = time_last = time_diff = 0;
        //loop EVENTS in each attempt
        for (var ev_key in attempt.a_file_group) {
          let events = attempt.a_file_group;
          if (events[ev_key].task_type == "single_choice") {
            if (ev_key == 0) {
              time_first = events[ev_key].time;
            }
            if (ev_key == events.length - 1) {
              time_last = events[ev_key].time;
              time_diff = (time_last - time_first) / 1000;
              this.time_data[taskname][attemptname] = time_diff;
            }
            if (events[ev_key].event == "select_click") {
              sel_points = events[ev_key].sel_points;
              sel_el = events[ev_key].s_val;
            }

            this.points_data[taskname][attemptname] = sel_points;
            this.selected_el_data[taskname][attemptname] = sel_el;
          }
        }
      }
    }

    console.log(this.time_data);

    createTableWorkbook(this.time_data);

    //*********************************************************** */
    //*********************************************************** */

    function createTableWorkbook(time_datas) {
      /* var workbook = new $.ig.excel.Workbook(
        $.ig.excel.WorkbookFormat.excel2007
      );
      var sheet = workbook.worksheets().add("Sheet1");
      sheet.columns(0).setWidth(72, $.ig.excel.WorksheetColumnWidthUnit.pixel);
      sheet.columns(1).setWidth(160, $.ig.excel.WorksheetColumnWidthUnit.pixel);
      sheet.columns(2).setWidth(110, $.ig.excel.WorksheetColumnWidthUnit.pixel);
      sheet.columns(3).setWidth(275, $.ig.excel.WorksheetColumnWidthUnit.pixel);

      // Create a to-do list table with columns for tasks and their priorities.
      sheet.getCell("A1").value("Forsøk");
      sheet.getCell("B1").value("Oppgaver");
      sheet.getCell("C1").value("Status");
      sheet.getCell("D1").value("Comment");
      var table = sheet.tables().add("A1:D8", true);

      // Specify the style to use in the table (this can also be specified as an optional 3rd argument to the 'add' call above).
      table.style(workbook.standardTableStyles("TableStyleMedium2")); */
      for (var task in time_datas) {
        for (var attempt in task) {
          if (attempt != 0) {
            for (var event in attempt) {
              event[0];

              // Populate the table with data
              sheet.getCell("A2").value(3223);
              sheet.getCell("B2").value("Jack Banner");
              sheet.getCell("C2").value("Approved");
              sheet.getCell("D2").value("");

              sheet.getCell("A3").value(3224);
              sheet.getCell("B3").value("Armin Barrywater");
              sheet.getCell("C3").value("In Review");
              sheet.getCell("D3").value("Underwriter is out until next week.");

              sheet.getCell("A4").value(3225);
              sheet.getCell("B4").value("Shiela Donahue");
              sheet.getCell("C4").value("In Review");
              sheet.getCell("D4").value("");

              sheet.getCell("A5").value(3226);
              sheet.getCell("B5").value("Perry Kane");
              sheet.getCell("C5").value("On Hold");
              sheet.getCell("D5").value("Waiting on paperwork from customer.");

              sheet.getCell("A6").value(3235);
              sheet.getCell("B6").value("Xavier Fannello");
              sheet.getCell("C6").value("New");
              sheet.getCell("D6").value("");

              sheet.getCell("A7").value(3244);
              sheet.getCell("B7").value("Georgi Angelchov");
              sheet.getCell("C7").value("New");
              sheet.getCell("D7").value("");

              sheet.getCell("A8").value(3257);
              sheet.getCell("B8").value("Imelda Sanchez");
              sheet.getCell("C8").value("New");
              sheet.getCell("D8").value("");
            }
          }
        }
      }

      // Sort the table by the Applicant column
      table
        .columns("Applicant")
        .sortCondition(new $.ig.excel.OrderedSortCondition());

      // Filter out the Approved applicants
      table
        .columns("Status")
        .applyCustomFilter(
          new $.ig.excel.CustomFilterCondition(
            $.ig.excel.ExcelComparisonOperator.notEqual,
            "Approved"
          )
        );

      // Save the workbook
      saveWorkbook(workbook, "Table.xlsx");
    }

    function saveWorkbook(workbook, name) {
      workbook.save(
        { type: "blob" },
        function (data) {
          saveAs(data, name);
        },
        function (error) {
          alert("Error exporting: : " + error);
        }
      );
    }

    //********************************************************************* */
    //********************************************************************* */
    //********************************************************************* */
    //********************************************************************* */
    //********************************************************************* */
    //********************************************************************* */
    //********************************************************************* */
    //********************************************************************* */
    //********************************************************************* */
    //********************************************************************* */
    //********************************************************************* */

    function getItemByKey(arr, key, value) {
      // here we look for existing group item in the result array
      return arr.reduce(function (prev, cur) {
        if (prev == null && cur[key] == value) {
          return cur;
        }
        return prev;
      }, null);
    }

    function checkPropForGroup(prop, key) {
      // here we check which columns should stay in the group,
      // and which should go down to group items.
      return prop == key || prop == key.replace("_id", "_name");
    }

    function cloneSuperItem(src, key) {
      // create super item by copying only group related fields
      var item = {};
      for (let prop in src) {
        if (checkPropForGroup(prop, key)) {
          item[prop] = src[prop];
        }
      }
      item[key + "_group"] = [];
      return item;
    }

    function cloneSubItem(src, key) {
      // create sub-item by copying all but group related fields
      var item = {};
      for (let prop in src) {
        if (!checkPropForGroup(prop, key)) {
          item[prop] = src[prop];
        }
      }
      return item;
    }

    function groupArray(arr, args, lvl) {
      var key = args[lvl];
      var result = [];
      arr.forEach(function (item, ind, a) {
        // find or create super item for group and then create sub item
        // and push it there
        var keyItem = getItemByKey(result, key, item[key]);
        if (!keyItem) {
          keyItem = cloneSuperItem(item, key);
          result.push(keyItem);
        }
        let subItem = cloneSubItem(item, key);
        keyItem[key + "_group"].push(subItem);
      });
      if (args[lvl + 1]) {
        // recursively make grouping on lower level
        for (var i = 0; i < result.length; i++) {
          result[i][key + "_group"] = groupArray(
            result[i][key + "_group"],
            args,
            lvl + 1
          );
        }
      }
      return result;
    }

    function groupArrayMain(arr, keysArray) {
      // keys should be simply listed as parameters in order from top group to lower
      return JSON.stringify(groupArray(arr, arguments, 1), null, "\n");
    }
  }
}
