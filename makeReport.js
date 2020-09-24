export default class makeReport {
  constructor(answers = null) {
    //jsonify: add "[" and "]" to start and end, strip "," to end
    let startfile_str = answers.match(/.*(?=,)?/);

    let forsok_files = startfile_str[0].slice(0, -1);
    answers =
      "[" +
      JSON.stringify(forsok_files) +
      answers.slice(startfile_str[0].length - 1, -1) +
      "]";

    this.tasks_time = [];
    this.tasks_points = [];
    this.tasks_sel_els = [];
    let attnumber = 0;
    let found_attempt_nums = false;

    answers = JSON.parse(answers);

    let time_first = 0,
      time_last = 0,
      time_diff = 0,
      obj = {},
      tasks = groupArrayMain(answers, "svgfile", "a_file");
    tasks = JSON.parse(tasks);

    //loop TASKS -> ATTEMPTS -> ACTIONS
    for (var task_key in tasks) {
      let task = tasks[task_key];
      let taskname = task.svgfile;

      this.tasks_time[task_key] = task_key == 0 ? forsok_files.split(",") : [];
      this.tasks_points[task_key] =
        task_key == 0 ? forsok_files.split(",") : [];
      this.tasks_sel_els[task_key] =
        task_key == 0 ? forsok_files.split(",") : [];

      //loop ATTEMPTS at each task
      for (var att_key in task.svgfile_group) {
        let attempt = task.svgfile_group[att_key];
        let attemptname = attempt.a_file;
        let sel_points = 0;
        let sel_points_hit = "";
        let sel_el = "";
        let sel_acc_points = 0;
        let sel_acc_els = [];
        let hit_els = [];
        let hit_targets = [];
        let hit_trg_src = [];
        let ball_count = 0;
        time_first = time_last = time_diff = 0;

        //loop EVENTS in each attempt
        for (var ev_key in attempt.a_file_group) {
          let event = attempt.a_file_group[ev_key];
          let events = attempt.a_file_group;

          //attnumber associate with filename to given attempt number in first col
          //error if no third task
          if (att_key == 0 && found_attempt_nums == false) {
            let ansers2 = JSON.stringify(startfile_str[0])
              .slice(1, -1)
              .split(",");

            for (var i = 0; i < ansers2.length; i++) {
              let att_task = ansers2[i].split(":");
              obj[att_task[1]] = att_task[0];
            }
            found_attempt_nums = true;
          }

          if (
            event.task_type == "single_choice" ||
            event.task_type == "multi_choice" ||
            event.task_type == "single_choice_hit" ||
            event.task_type == "ordinal" ||
            event.task_type == "quantity" ||
            event.task_type == "dice_sum"
          ) {
            if (ev_key == 0) {
              time_first =
                typeof event.time === "object" ? event.time[0] : event.time;
            }

            if (
              event.event == "select_click" ||
              event.event == "hit" ||
              (event.event == "not_hit" &&
                (task.svgfile == "129_numberandquantity7.svg" ||
                  task.svgfile == "130_numberandquantity8.svg" ||
                  task.svgfile == "139_quantitydiscrimination7.svg"))
            ) {
              sel_points =
                event.sel_points != null &&
                typeof Number(event.sel_points) === "number"
                  ? Number(event.sel_points)
                  : 0;
              //sel_el = event.event == "hit" ? event.target_val : event.s_val;

              //if we also want to know the wrong target elements selected
              if (event.task_type == "ordinalx") {
                sel_el = event.s_val + ";" + event.target_val;
              } else {
                sel_el = event.s_val;
              }

              //no values in quantity tasks, use id as value for sel_id instead
              if (event.task_type == "quantity") {
                sel_el = event.src_id;
              }
              sel_acc_points = sel_acc_points + sel_points;

              sel_acc_els[event.src_id] = sel_el + "|" + event.sel_points;

              if (
                event.task_type == "single_choice_hit" &&
                event.event == "hit"
              ) {
                if (sel_el == event.target_val) {
                  sel_points_hit = 1;
                } else sel_points_hit = 0;
                //actual target id is diplayed in report
                sel_el = event.target_val;
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
                  //if (ball_count > 0 && hit_els[event.src_id] == true) {
                  if (hit_els[event.src_id] != null) {
                    ball_count--;
                    delete hit_els[event.src_id];
                    //hit_els[event.src_id] = false;
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

              //IF task of dicesum (eg dice hit target),
              //AND this ball is not registered as in target
              // -> increase ball count
              if (event.task_type == "dice_sum") {
                hit_trg_src[event.src_id] =
                  hit_trg_src[event.target_id] != undefined
                    ? event.target_id +
                      "|" +
                      (parseInt(hit_trg_src[event.target_id]) +
                        parseInt(event.s_val))
                    : event.target_id + "|" + parseInt(event.s_val);
              }
            }
            if (event.event == "de-select_click") {
              let val_point = sel_acc_els[event.src_id].split("|");
              if (val_point[1] == "1") {
                sel_acc_points = sel_acc_points - 1;
              }
              if (sel_acc_els[event.src_id] != null) {
                delete sel_acc_els[event.src_id];
              }
              //remove element from sel_acc_els[src_id]
            }
            if (
              event.event == "not_hit" &&
              task.svgfile != "129_numberandquantity7.svg" &&
              task.svgfile != "130_numberandquantity8.svg" &&
              task.svgfile != "139_quantitydiscrimination7.svg"
            ) {
              //if a ball hit from a specific source ball exists and this is involved in not_hit event, delete it
              if (hit_els[event.src_id] != null) {
                delete hit_els[event.src_id];
                ball_count--;
              }
              //if dice task and a specific target has a dice removed from its surface, remove the dice points of this target's actual dice points
              if (
                event.task_type == "dice_sum" &&
                hit_trg_src[event.src_id] != undefined
              ) {
                delete hit_trg_src[event.src_id];
              }
            }

            if (ev_key == events.length - 1) {
              if (
                event.task_type == "ordinal" ||
                event.task_type == "quantity"
              ) {
                sel_points_hit = ball_count == event.num_targs_to_hit ? 1 : 0;
                //sel_el = event.task_type == "quantity" ? ball_count : hit_els;

                //sel_el = ball_count;
                sel_el = sel_acc_els;
              }

              time_last =
                typeof event.time === "object" ? event.time[0] : event.time;

              time_diff = (time_last - time_first) / 1000;
              this.tasks_time[task_key][att_key] = Array(
                taskname,
                attemptname,
                time_diff
              );
            }

            //if multiple choice, the values are accumulated and written to result arrays on last event in attempt at task
            if (
              (event.task_type == "multi_choice" ||
                event.task_type == "ordinal" ||
                event.task_type == "quantity") &&
              ev_key == events.length - 1
            ) {
              if (event.task_type == "multi_choice") {
                sel_points = sel_acc_points;
                sel_el = sel_acc_els;
              } else {
                sel_el = sel_acc_els;
              }
            }

            if (event.task_type == "dice_sum" && ev_key == events.length - 1) {
              //Dices that hit targets are indexes in hit_trg_src array (trg id | val). Loop array and group by trg id to find sum per targets.
              //Points given if targets have dices with value of n
              for (var key in hit_trg_src) {
                let trg_sval = hit_trg_src[key].split("|");

                if (hit_targets[trg_sval[0]] == undefined) {
                  hit_targets[trg_sval[0]] = parseInt(trg_sval[1]);
                } else
                  hit_targets[trg_sval[0]] =
                    parseInt(hit_targets[trg_sval[0]]) + parseInt(trg_sval[1]);
              }
              for (var key in hit_targets) {
                sel_points +=
                  hit_targets[key] == event.num_targs_to_hit ? 1 : 0;
              }
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

    let tasks_sco_sel_tim = {};
    tasks_sco_sel_tim = [
      this.tasks_points,
      this.tasks_sel_els,
      this.tasks_time,
    ];

    createTableWorkbook(tasks_sco_sel_tim, obj);

    function cumm(sel_el) {
      let k_sep = "",
        sel_ele = "";
      for (var key in sel_el) {
        sel_ele = sel_el[key].contains("|")
          ? sel_el[key].split("|")[0]
          : sel_el;

        k_sep += sel_ele + ",";
      }
      return k_sep.slice(0, -1);
    }

    //*********************************************************** */
    //*********************************************************** */

    function createTableWorkbook(tasks_sco_sel_tim, obj) {
      var workbook = new $.ig.excel.Workbook(
        $.ig.excel.WorkbookFormat.excel2007
      );
      let sheets = [];
      sheets[0] = workbook.worksheets().add("Score");
      sheets[1] = workbook.worksheets().add("Selections");
      sheets[2] = workbook.worksheets().add("Time consumed");

      for (var key in tasks_sco_sel_tim) {
        let tasks = tasks_sco_sel_tim[key];

        sheets[key].getCell("A1").value("Forsøk");

        //number of columns depends on number of tasks
        var table = sheets[key].tables().add("A1:AZ70", true);

        // Specify the style to use in the table (this can also be specified as an optional 3rd argument to the 'add' call above).
        table.style(workbook.standardTableStyles("TableStyleMedium2"));

        let row_of_firstcol = {};
        let alfachar = "A";
        let att_id_txt;

        //each tasks in horizontal (letter) columns
        for (let task = 0; task < tasks.length; task++) {
          let attempts = tasks[task];
          if (attempts.length != 0) {
            let first_row = true; //some tasks are not listed in taskreport (eg start_task)

            //each task's attempts in vertical (number) rows
            for (let att = 0; att < attempts.length; att++) {
              let task_attempt_values = attempts[att];

              //add attempt name only in first column, and values in the next columns
              if (task == 0) {
                att_id_txt = attempts[att].split(":");
                row_of_firstcol[att_id_txt[0]] = att;

                sheets[key].getCell("A" + (att + 2)).value(att_id_txt[1]);
              } else {
                //add header cols with task names
                if (first_row == true) {
                  sheets[key]
                    .columns(task)
                    .setWidth(72, $.ig.excel.WorksheetColumnWidthUnit.pixel);
                  first_row = false;
                  alfachar = nextChar(alfachar);
                  sheets[key]
                    .getCell(alfachar + 1)
                    .value(task_attempt_values[0]);
                }

                sheets[key]
                  .getCell(
                    alfachar +
                      (row_of_firstcol[task_attempt_values[1].slice(5, 9)] + 2)
                  )
                  .value(task_attempt_values[2]);
              }
            }
          }
        }

        // Sort the table by the Forsøk column
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
      }
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
      if (c == "Z") {
        return "AA";
      }
      if (c.length == 2) {
        return "A" + String.fromCharCode(c.charCodeAt(1) + 1);
      } else {
        return String.fromCharCode(c.charCodeAt(0) + 1);
      }
    }

    function getKeyByValue(object, value) {
      return Object.keys(object).find((key) => object[key] === value);
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
