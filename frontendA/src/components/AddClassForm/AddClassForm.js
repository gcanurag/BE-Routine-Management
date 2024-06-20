import React, { Component } from "react";
import { navigate } from "@reach/router";
import {
  Form,
  Select,
  Card,
  InputNumber,
  Input,
  Typography,
  Button,
  Radio,
  Modal,
  message,
} from "antd";
import axios from "axios";
import "antd/dist/antd.css";

import { apiClassUrl, apiTeacherUrl, apiProgramUrl, apiSubjectUrl } from "../../utils/utils";
import { subjects } from "../../utils/utils";

const { Option } = Select;
const layout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 16,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 3,
    span: 16,
  },
};
const { Title } = Typography;


// class AddClassPopupForm extends Component {
class AddClassPopupForm extends Component {
  constructor(props) {
    super(props);


    this.state = {
      teacherData: "",
      subjectData: [],

      programData: "",
      routineFor: "",
      selectedSubjectID: "",
      teacherName: [""],
      classCode: "",
      classGroup: "",
      startingPeriod: props.index,
      noOfPeriod: 1,
      courseCode: "",
      link1: "",
      weekDay: "",
      formCollapsed: false

    };
    this.getSubjectData();
  }
  
  
  getTeacherData = async () => {
    let { data: res } = await axios.get(apiTeacherUrl);
    
    this.setState({ teacherData: res.data });
    if (this.subjectData) {
      console.log(this.subjectData);
    }
    console.log('Got teachers')
  };
  
  getSubjectData = async () => {
    console.log('Got subjects')
    let response = await axios.get(apiSubjectUrl + `/`);
    let { data: res } = response;
    // console.log(response,"look response")
    this.setState({ subjectData: res.data });
    if (this.subjectData) {
     await  this.getTeacherData();
    }
    
  }

  onFinish = async (values) => {
    const islengthValid = await this.handlePeriodLength();
    const isTeacherAvailable = await this.handleTeacherAvailability();
    console.log(isTeacherAvailable)
    console.log(islengthValid)
    console.log('check')

    if (!isTeacherAvailable)
      return

    const { programName, year, part, section, day, index, teacherTable, reloadFunc } = this.props;
    const programParams = `/programName/${programName}/year/${year}/part/${part}/section/${section}`;
    console.log(programParams)

    let programRes = await axios.get(apiProgramUrl + programParams)
    const programID = programRes.data.data;
    console.log(programID);


    await axios.post(apiClassUrl, {
      routineFor: programID,
      subjectID: this.state.selectedSubjectID,
      teacherName: values.teacherName,
      classType: values.classCode,
      classGroup: values.classGroup,
      startingPeriod: index,
      noOfPeriod: values.noOfPeriod,
      courseCode: values.courseCode,
      link1: values.link1,
      weekDay: day,
    })
      .then(message.success("Class Added Sucessfully"));

    Modal.destroyAll();

    reloadFunc();
  };

  async handlePeriodLength() {
    try {
      let { programName, year, part, section, day, index } = this.props;
      let { noOfPeriod } = this.state;
      const programParams = `/programName/${programName}/year/${year}/part/${part}/section/${section}`

      const { data: resProgram } = await axios.get(apiProgramUrl + programParams);
      const programID = resProgram.data;

      const validityCheckParams = `/valid/${programID}/day/${day}/period/${index}/nperiods/${noOfPeriod}`
      const { data: validRes } = await axios.get(apiClassUrl + validityCheckParams);

      const validity = validRes.data;
      if (validity.valid)
        return true;

      const overlapClass = validity.overlap;
      const programStr = `Year ${year}/${part} ${programName} ${section}`
      const invalidLengthWarning = `Period collides with class ${overlapClass.subject.subjectName} [${overlapClass.classType}] for ${programStr}`
      Modal.warning({ title: invalidLengthWarning });
      return false

    } catch (error) {
      console.log(error);
      return false;
    }

  }


  async handleTeacherAvailability() {
    let { day, index } = this.props;
    let { noOfPeriod, teacherName } = this.state;
    let nperiods = noOfPeriod
    let teachers = teacherName;


    for (let teacherID of teachers) {
      const resTeacher = await axios.get(apiTeacherUrl + `/${teacherID}`);
      const teacherObj = resTeacher.data.data;

      const availabilityCheckParams = `/available/teacher/${teacherID}/day/${day}/period/${index}/nperiods/${nperiods}`
      const resAvailability = await axios.get(apiClassUrl + availabilityCheckParams);
      if (!resAvailability.data.data.available) {
        const teacherName = teacherObj.teacherName;
        const occupiedAtPeriod = resAvailability.data.data.overlapAt;
        const occupiedAtClass = resAvailability.data.data.overlapClass
        const occupiedAtProgram = occupiedAtClass.routineFor;
        const occupiedAtSubjectStr = `${occupiedAtClass.subject.subjectName} [${occupiedAtClass.classType}]\r\n Period: ${occupiedAtClass.startingPeriod} - ${occupiedAtClass.startingPeriod + occupiedAtClass.noOfPeriod - 1}`;

        const overlapClassStr = `Year ${occupiedAtProgram.year} ${occupiedAtProgram.programName} ${occupiedAtProgram.section}`
        Modal.warning({
          title: `Teacher ${teacherName} occupied at ${overlapClassStr} on ${day} at period ${occupiedAtPeriod}\r\n\r\n${occupiedAtSubjectStr}`,
        });
        return false;
      }
    }
    return true;
  }

  render() {
    const {
      teacherData,
      subjectData,
    } = this.state;


    return (
      <div>
        <Form
          {...layout}
          ref={this.formRef}
          name="control-ref"
          onFinish={this.onFinish}
          onValuesChange={(value) => {
            try {
              console.log("vALUE  ")
              console.log(value)

              if (value.noOfPeriod != undefined)
                this.setState({ noOfPeriod: parseInt(value.noOfPeriod) }, async () => {
                  await this.handlePeriodLength()
                  await this.handleTeacherAvailability()
                }
                );
              else if (value.teacherName != undefined)
                this.setState({ teacherName: value.teacherName }, this.handleTeacherAvailability);
              else if (value.subjectName != undefined)
                this.setState({ selectedSubjectID: toString(value.subjectName) });
            } catch (error) {
              console.log(error);
            }
          }}
        >
          <Form.Item
            name="subjectName"
            label="Subject"
            rules={[
              {
                required: true,
                message: "Please enter Subject Name",
              },
            ]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              onChange={(value) => {
                console.log("value", value)
                this.setState({ selectedSubjectID: value })
              }}
            >
              {subjectData.map((item, index) => {
                return (
                  <Option key={item.subjectName} value={`${item._id}`} label={item.subjectName}>
                    {item.subjectName}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item
            name="classCode"
            label="Class type"
            rules={[
              {
                required: false,
                message: "Please enter Class Code",
              },
            ]}
            initialValue="L"
          >
            <Radio.Group defaultValue={"L"}>
              <Radio.Button key="L" value="L">
                Lecture [L]
              </Radio.Button>
              <Radio.Button key="L" value="P">
                Practical [P]
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="teacherName"
            label="Teachers"
            rules={[
              {
                required: true,
                message: "Please select teachers name",
                type: "array",
              },
            ]}
          >
            <Select
              mode="multiple"
              // placeholder="Select a option and change input text above"
              optionFilterProp="label"
              onChange={(values) => {
                console.log(values)
                // this.handleTeacherSelection(values);
              }}
              dropdownAlign="bottom"
            >
              {Object.values(teacherData).map((item, index) => {
                return (
                  <Option key={item._id} value={item._id} label={item.teacherName}>
                    {item.teacherName}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>

          <Form.Item label="No Of Periods">
            <Form.Item
              name="noOfPeriod"
              rules={[
                {
                  required: true,
                  message: "Please enter No Of Periods",
                },
              ]}
              noStyle
              initialValue="1"
            >
              <Radio.Group defaultValue="1">
                <Radio.Button key="1" value="1">
                  1
                </Radio.Button>
                <Radio.Button key="2" value="2">
                  2
                </Radio.Button>
                <Radio.Button key="3" value="3">
                  3
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Button
              type="primary"
              style={{ backgroundColor: "#141414" }}
              htmlType="submit"
            // onClick={this.onFinish}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}
export { AddClassPopupForm };

// export { AddClassPopupForm };
