export default class makeReport {
  constructor(answers = null) {
    //jsonify: add "[" and "]" to start and end, strip "," to end
    let forsok_files = answers.match(/.*(?=,)?/)[0].slice(0, -1);
    answers = "[" + answers.slice(forsok_files.length + 1, -1) + "]";

    this.tasks_time = [];
    this.tasks_points = [];
    this.tasks_sel_els = [];
    let attnumber = 0;

    answers = JSON.parse(answers);

    let time_first = 0,
      time_last = 0,
      time_diff = 0,
      tasks = groupArrayMain(answers, "svgfile", "a_file");
    tasks = JSON.parse(tasks);

    //loop TASKS -> ATTEMPTS -> ACTIONS
    for (var t_key in tasks) {
      let task = tasks[t_key];
      let taskname = task.svgfile;
      let tp = forsok_files.replaceAll('"', "").split(",");
      this.tasks_time[t_key] = t_key == 0 ? tp : [];
      this.tasks_points[t_key] = t_key == 0 ? tp : [];
      this.tasks_sel_els[t_key] = t_key == 0 ? tp : [];

      //loop ATTEMPTS at each task
      for (var att_key in task.svgfile_group) {
        let attempt = task.svgfile_group[att_key];
        let attemptname = attempt.a_file;
        let sel_points = null;
        let sel_points_hit = "";
        let sel_el = "";
        let sel_acc_points = 0;
        let sel_acc_els = [];
        let hit_els = [];
        let hit_targets = [];
        let hit_trg_src = [];
        let ball_count = 0;
        let numline_value = null;
        let isNumberLineTask = false;
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
            event.task_type == "quantity" ||
            event.task_type == "dice_sum"
          ) {
            if (ev_key == 0) {
              time_first =
                typeof event.time === "object" ? event.time[0] : event.time;
            }

            //isNumberLineTask = false;

            //why condition on 129, 130, 089?
            if (
              event.event == "select_click" ||
              event.event == "hit" ||
              (event.event == "not_hit" &&
                (tasks[t_key].svgfile == "129_numberandquantity7.svg" ||
                  tasks[t_key].svgfile == "130_numberandquantity8.svg" ||
                  tasks[t_key].svgfile == "139_quantitydiscrimination7.svg"))
              //|| tasks[t_key].svgfile.contains("Estimation")))
            ) {
              sel_points =
                event.sel_points != null &&
                typeof Number(event.sel_points) === "number"
                  ? Number(event.sel_points)
                  : null;
              //sel_el = event.event == "hit" ? event.target_val : event.s_val;

              //if we also want to know the wrong target elements selected
              if (event.task_type == "ordinalx") {
                sel_el = event.s_val + ";" + event.target_val;
              } else {
                sel_el = event.s_val;
              }

              if (
                event.event == "hit" &&
                (tasks[t_key].svgfile.contains("Estimation5") ||
                  tasks[t_key].svgfile.contains("Estimation6") ||
                  tasks[t_key].svgfile.contains("Estimation7") ||
                  tasks[t_key].svgfile.contains("Estimation8") ||
                  tasks[t_key].svgfile.contains("Estimation9") ||
                  tasks[t_key].svgfile.contains("Estimation10"))
              ) {
                let linepos = [];

                if (tasks[t_key].svgfile.contains("Estimation10"))
                  linepos = [503, 5, 1237, 10];
                if (tasks[t_key].svgfile.contains("Estimation5"))
                  linepos = [598, 7, 1236, 10];
                if (tasks[t_key].svgfile.contains("Estimation6"))
                  linepos = [448, 57, 1187, 10];
                if (tasks[t_key].svgfile.contains("Estimation7"))
                  linepos = [660, 35, 1348, 20];
                if (tasks[t_key].svgfile.contains("Estimation8"))
                  linepos = [686, 28, 1220, 20];
                if (tasks[t_key].svgfile.contains("Estimation9"))
                  linepos = [708, 29, 1231, 20];

                let tot_x = event.x + linepos[0];
                //start position of source is 503px, eventx is relative to this,
                //so add this to the absolute x-values of targets (0 and 10)
                numline_value =
                  /* tot_x + ": " + */ (tot_x / (linepos[2] - linepos[1])) *
                  linepos[3];
                numline_value = numline_value.toFixed(2);
                isNumberLineTask = true;
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

              //Ordinal task: if Source and Target number correspond (and not already counted) -> increase "ball_count". Else decrease count
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
              tasks[t_key].svgfile != "129_numberandquantity7.svg" &&
              tasks[t_key].svgfile != "130_numberandquantity8.svg" &&
              tasks[t_key].svgfile != "139_quantitydiscrimination7.svg"
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
                //if tallinje task -> value on line is written to excel
                if (isNumberLineTask) sel_points_hit = numline_value;
                //sel_el = event.task_type == "quantity" ? ball_count : hit_els;

                //sel_el = ball_count;
                sel_el = sel_acc_els;
              }

              time_last =
                typeof event.time === "object" ? event.time[0] : event.time;
              //POPULATE POINTS, SELECTIONS AND TIME ARRAYS FOR DISPLAY IN SHEETS
              time_diff = (time_last - time_first) / 1000;
              this.tasks_time[t_key][att_key] = Array(
                taskname,
                attemptname,
                time_diff,
                time_first,
                time_last
              );
            }

            //IF MULTIPLE CHOICE, THE VALUES ARE ACCUMULATED AND WRITTEN TO RESULT ARRAYS ON LAST EVENT IN ATTEMPT AT TASK
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
            //POPULATE POINTS, SELECTIONS AND TIME ARRAYS FOR DISPLAY IN SHEETS
            this.tasks_points[t_key][att_key] = Array(
              taskname,
              attemptname,
              sel_points_hit > 0 ? sel_points_hit : sel_points
            );

            this.tasks_sel_els[t_key][att_key] = Array(
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

    createTableWorkbook(tasks_sco_sel_tim);

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

    function createTableWorkbook(tasks_sco_sel_tim) {
      var workbook = new $.ig.excel.Workbook(
        $.ig.excel.WorkbookFormat.excel2007
      );
      let sheets = [];
      sheets[0] = workbook.worksheets().add("Score");
      sheets[1] = workbook.worksheets().add("Selections");
      sheets[2] = workbook.worksheets().add("Time consumed");
      //GO THROUGH EACH SHEET, POPULATE WITH SCORE, SELECTION AND TIME CONSUME FROM ARRAYS PRODUCED ABOVE
      for (var key in tasks_sco_sel_tim) {
        let tasks = tasks_sco_sel_tim[key];

        sheets[key].getCell("A1").value("Forsøk");
        if (key == 2) sheets[key].getCell("B1").value("Tidsrom");

        //ALLOCATE TABLE COLS AND ROWS FOR CONTENT
        var table = sheets[key].tables().add("A1:AZ600", true);

        // Specify the style to use in the table (this can also be specified as an optional 3rd argument to the 'add' call above).
        table.style(workbook.standardTableStyles("TableStyleMedium2"));

        let row_of_firstcol = {};
        let alfachar = "A";
        let started = [];
        let ended = [];

        //EACH TASKS IN HORIZONTAL (letters A, B, C...) COLUMNS
        for (let task = 0; task < tasks.length; task++) {
          let attempts = tasks[task];

          if (attempts.length != 0) {
            //EACH TASK'S ATTEMPTS IN VERTICAL (NUMBER) ROWS
            for (let att = 0; att < attempts.length; att++) {
              let task_attempt_values = attempts[att];

              //IF TIME SHEET -> ADD START AND END TIME OF ATTEMPT
              if (key == 2 && task_attempt_values[4] != undefined) {
                //GET EARLIEST START AND LATEST END TIME
                if (task > 0) {
                  if (
                    task_attempt_values[3] < started[att] ||
                    started[att] == undefined
                  ) {
                    started[att] = task_attempt_values[3];
                  }
                  if (
                    task_attempt_values[3] > started[att] ||
                    ended[att] == undefined
                  ) {
                    ended[att] = task_attempt_values[4];
                  }
                }

                if (task == tasks.length - 1) {
                  //DISPLAY START AND END TIME OF ATTEMPT
                  let date = new Date(started[att]).toISOString().slice(0, 10);
                  let start = new Date(started[att])
                    .toISOString()
                    .slice(11, -5);

                  let end = new Date(ended[att]).toISOString().slice(11, -5);
                  sheets[key]
                    .getCell("B" + (att + 2))
                    .value(date + " " + start + "-" + end);
                }
              }
              //ADD ATTEMPT NAME ONLY IN FIRST COLUMN, AND VALUES IN THE NEXT COLUMNS
              if (task == 0) {
                //MAKE SURE VALUES IN SAME ROW AS Forsøk (att), E.G. TASK VALUES OF F45 IS DISPLAYED IN ITS COLS
                row_of_firstcol[attempts[att].split(":")[0]] = att;
                alfachar = "A";
                sheets[key]
                  .getCell(alfachar + (att + 2))
                  .value(attempts[att].split(":")[1]);
                alfachar = nextChar(alfachar); //GET NEXT COLUMN LETTER
              } else {
                //FIRST att TABLEROW IS HEADER WITH TASK NAMES
                if (att == 0) {
                  sheets[key]
                    .columns(task)
                    .setWidth(72, $.ig.excel.WorksheetColumnWidthUnit.pixel);
                  alfachar = nextChar(alfachar); //GET NEXT COLUMN LETTER
                  sheets[key]
                    //DISPLAY EACH COLUMN HEADER WITH TASK NAME
                    .getCell(alfachar + 1)
                    .value(task_attempt_values[0]);
                }

                //DISPLAY THE DIFFERENT ROWS IN RESPECTIVE Forsøk ROWS
                sheets[key]
                  .getCell(
                    alfachar +
                      (row_of_firstcol[
                        task_attempt_values[1].split(".")[0].slice(5) //extract attempt id from file name in log
                      ] +
                        2)
                  )
                  .value(task_attempt_values[2]);
              }
            }
          }
        }

        // SORT THE TABLE BY THE Forsøk COLUMN
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
