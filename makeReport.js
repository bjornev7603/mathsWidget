export default class makeReport {
  constructor(answers = null) {
    //jsonify: add "[" and "]" to start and end, strip "," to end
    answers = "[" + answers.slice(0, -1) + "]";

    this.tasks_time = [];
    this.tasks_points = [];
    this.tasks_sel_els = [];

    answers = JSON.parse(answers);

    let time_first = 0,
      time_last = 0,
      time_diff = 0,
      tasks = groupArrayMain(answers, "svgfile", "a_file");
    tasks = JSON.parse(tasks);

    //loop TASKS -> ATTEMPTS -> ACTIONS
    for (var task_key in tasks) {
      let task = tasks[task_key];
      let taskname = task.svgfile;

      this.tasks_time[task_key] = [];
      this.tasks_points[task_key] = [];
      this.tasks_sel_els[task_key] = [];

      //loop ATTEMPTS at each task
      for (var att_key in task.svgfile_group) {
        let attempt = task.svgfile_group[att_key];
        let attemptname = attempt.a_file;
        let sel_points = 0;
        let sel_points_hit = "";
        //let sel_all_targs_hit = "";
        let sel_el = "";
        let sel_acc_points = "";
        let sel_acc_els = [];
        let hit_els = [];
        let ball_count = 0;

        time_first = time_last = time_diff = 0;
        //loop EVENTS in each attempt
        for (var ev_key in attempt.a_file_group) {
          let event = attempt.a_file_group[ev_key];
          let events = attempt.a_file_group;
          if (
            event.task_type == "single_choice" ||
            event.task_type == "multi_choice" ||
            event.task_type == "single_choice_hit" ||
            event.task_type == "ordinal" ||
            event.task_type == "quantity"
          ) {
            if (ev_key == 0) {
              time_first = event.time;
            }

            if (event.event == "select_click" || event.event == "hit") {
              sel_points =
                event.sel_points != null &&
                typeof Number(event.sel_points) === "number"
                  ? Number(event.sel_points)
                  : 0;
              //sel_el = event.event == "hit" ? event.target_val : event.s_val;
              sel_el = event.s_val;
              sel_acc_points += sel_points;
              sel_acc_els[event.src_id] = sel_el;
              if (event.task_type == "single_choice_hit") {
                if (sel_el == event.target_val) {
                  sel_points_hit = 1;
                } else sel_points_hit = 0;
              }

              if (event.task_type == "ordinal") {
                if (sel_el == event.target_val) {
                  if (
                    hit_els[event.src_id] == null ||
                    hit_els[event.src_id] == false
                  ) {
                    ball_count++;
                    hit_els[event.src_id] = true;
                  }
                } else {
                  if (ball_count > 0 && hit_els[event.src_id] == true) {
                    ball_count--;
                    hit_els[event.src_id] = false;
                  }
                }
              }
              //IF task of quantity (eg count ball hit target),
              //AND this ball is not registered as in target
              // -> increase ball count
              if (event.task_type == "quantity") {
                if (hit_els[event.src_id] == null) {
                  ball_count++;
                  hit_els[event.src_id] = true;
                }
              }
            }
            if (event.event == "de-select_click") {
              sel_acc_points -= sel_points;
              if (sel_acc_els[event.src_id] != null) {
                delete sel_acc_els[event.src_id];
              }
              //remove element from sel_acc_els[src_id]
            }
            if (event.event == "not_hit") {
              if (hit_els[event.src_id] != null) {
                delete hit_els[event.src_id];
                ball_count--;
              }
            }

            if (ev_key == events.length - 1) {
              if (
                event.task_type == "ordinal" ||
                event.task_type == "quantity"
              ) {
                sel_points_hit = ball_count == event.num_targs_to_hit ? 1 : 0;
              }

              time_last = event.time;
              time_diff = (time_last - time_first) / 1000;
              this.tasks_time[task_key][att_key] = Array(
                taskname,
                attemptname,
                time_diff
              );
            }

            if (event.task_type == "single_choice") {
            }

            //if multiple choice, the values are accumulated and written to result arrays on last event in attempt at task
            if (
              event.task_type == "multi_choice" &&
              ev_key == events.length - 1
            ) {
              sel_points = sel_acc_points;
              sel_el = sel_acc_els;
            }

            this.tasks_points[task_key][att_key] = Array(
              taskname,
              attemptname,
              sel_points_hit > 0 ? sel_points_hit : sel_points
            );
            this.tasks_sel_els[task_key][att_key] = Array(
              taskname,
              attemptname,
              (sel_el = Array.isArray(sel_el) ? cumm(sel_el) : sel_el)
            );
          }
        }
      }
    }

    createTableWorkbook(this.tasks_points);

    function cumm(sel_el) {
      let k_sep = "";
      for (var key in sel_el) {
        k_sep += sel_el[key] + ",";
      }
      return k_sep.slice(0, -1);
    }

    //*********************************************************** */
    //*********************************************************** */

    function createTableWorkbook(tasks) {
      var workbook = new $.ig.excel.Workbook(
        $.ig.excel.WorkbookFormat.excel2007
      );
      var sheet = workbook.worksheets().add("Sheet1");

      sheet.getCell("A1").value("Forsøk");

      //number of columns depends on number of tasks
      var table = sheet.tables().add("A1:Z50", true);

      // Specify the style to use in the table (this can also be specified as an optional 3rd argument to the 'add' call above).
      table.style(workbook.standardTableStyles("TableStyleMedium2"));

      let alfachar = "A";
      let first_col = true;
      let valid_task_nr = 0;
      for (let task = 0; task < tasks.length; task++) {
        let attempts = tasks[task];
        if (attempts.length != 0) {
          valid_task_nr++;
          let first_row = true; //some tasks are not listed in taskreport (eg start_task)

          for (let att = 0; att < attempts.length; att++) {
            let task_attempt_values = attempts[att];

            //add header cols with task names
            if (first_row == true) {
              sheet
                .columns(valid_task_nr)
                .setWidth(72, $.ig.excel.WorksheetColumnWidthUnit.pixel);
              first_row = false;
              alfachar = nextChar(alfachar);
              sheet.getCell(alfachar + 1).value(task_attempt_values[0]);
            }
            //add attempt name only in first, and values in the next columns
            if (first_col == true) {
              sheet.getCell("A" + (att + 2)).value(task_attempt_values[1]);
            }

            sheet.getCell(alfachar + (att + 2)).value(task_attempt_values[2]);
          }
          if (first_col == true) first_col = false;
        }
      }

      // Sort the table by the Applicant column
      table
        .columns("Forsøk")
        .sortCondition(new $.ig.excel.OrderedSortCondition());

      // Filter out the Approved applicants
      /* table
        .columns("Status")
        .applyCustomFilter(
          new $.ig.excel.CustomFilterCondition(
            $.ig.excel.ExcelComparisonOperator.notEqual,
            "Approved"
          )
        );
 */
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

    function nextChar(c) {
      return String.fromCharCode(c.charCodeAt(0) + 1);
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
