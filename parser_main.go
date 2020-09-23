package main

import (
	"encoding/csv"
	"encoding/json"
	"flag"
	"io/ioutil"
	"os"
	"regexp"

	// "httpsgithub.com/JensRantil/go-csv"
	
	"github.com/cheggaaa/pb/tree/master"
	
	//"pb-master/v3"
	//"./pb-master/v3"
)

// CsvLine represents the fields in the csv to be read
type CsvLine struct {
	created string
	ans     map[string]interface{}
	final   string
	ansID   string
	taskID  string
	attempt string
}

func main() {
	file := flag.String("f", "data.csv", "csv-file to parse, e.g. data.csv")
	output := flag.String("o", "./answer", "Output path of JSON-files")
	
	//find position of first svgfile (with task) string
	//r, _ := regexp.Compile("svgfile': '")
	
	//find svgfile name with apostrophes
	//r2, _ := regexp.Compile("'([a-z|.|_|-]+)'")
	
	
	flag.Parse()
	lines, err := ReadCsv(*file)
	if err != nil {
		panic(err)
	}
	pb := pb.StartNew(len(lines))
	// Loop through lines & turn into object
	for _, line := range lines {

		var ans map[string]interface{}
		json.Unmarshal([]byte(sanitizeData(line[1])), &ans)

		data := CsvLine{
			created: line[0],
			ans:     ans,
			//r2(r.FindStringIndex(line[1]), line[1]),
			final:   line[2],
			ansID:   line[4],
			taskID:  line[6], 
			//_ "-" _ r2(r.FindStringIndex(line[1]), line[1]), 
			attempt: line[7],
		}

		if len(data.ans) != 0 {
			
			  path := *output + "/" + data.created[0:10] + "/"
			path_sub := *output + "/" + data.created[0:10] + "/" + data.attempt + "/"
			err := os.MkdirAll(path, os.ModePerm)
			if err != nil {
				panic("Error making folders...")
			}

			for _, val := range data.ans {
				
				filename := data.taskID + "-" + data.attempt +  ".json"
				filename_sub := data.taskID + ".json"
				jsonData, _ := json.MarshalIndent(val, "", "  ")
				ioutil.WriteFile(path+filename, jsonData, os.ModePerm)
				ioutil.WriteFile(path_sub+filename_sub, jsonData, os.ModePerm)
			}
		}
		pb.Increment()

	}
	pb.Finish()
}

// ReadCsv accepts a file and returns its content as a multi-dimentional type
// with lines and each column. Only parses to string type.
func ReadCsv(filename string) ([][]string, error) {

	// Open CSV file
	f, err := os.Open(filename)
	if err != nil {
		return [][]string{}, err
	}
	defer f.Close()

	// Read File into a Variable
	lines, err := csv.NewReader(f).ReadAll()

	// opts := csv.Dialect{Quoting: csv.QuoteNonNumeric, DoubleQuote: csv.DoubleQuoteDefault, QuoteChar: '"'}
	// r := csv.NewDialectReader(f, opts)
	// lines, err := r.ReadAll()
	if err != nil {
		return [][]string{}, err
	}

	return lines, nil
}

// Sanitizer represents a compiled regular expression and a string to replace all mathces.
type Sanitizer struct {
	regex   regexp.Regexp
	replace string
}

func sanitizeData(s string) string {
	str := s
	regs := []Sanitizer{}
	reDoubleQuotes := regexp.MustCompile(`"`)
	reSingleQuotes := regexp.MustCompile("'")
	reTempQuotes := regexp.MustCompile("`")

	//None to null..
	regs = append(regs, Sanitizer{regex: *regexp.MustCompile("None"), replace: "null"})

	//Snake_case issues..
	regs = append(regs, Sanitizer{regex: *regexp.MustCompile("delta_time"), replace: "deltaTime"})
	regs = append(regs, Sanitizer{regex: *regexp.MustCompile("object_name"), replace: "objectName"})
	regs = append(regs, Sanitizer{regex: *regexp.MustCompile("object_type"), replace: "objectType"})
	regs = append(regs, Sanitizer{regex: *regexp.MustCompile("definition_string"), replace: "definitionString"})

	regs = append(regs, Sanitizer{regex: *reDoubleQuotes, replace: "`"})
	regs = append(regs, Sanitizer{regex: *reSingleQuotes, replace: `"`})
	regs = append(regs, Sanitizer{regex: *reTempQuotes, replace: "'"})

	for _, re := range regs {
		str = re.regex.ReplaceAllLiteralString(str, re.replace)
	}
	return str
}

