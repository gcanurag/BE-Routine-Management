import React, { Component } from "react";
import axios from "axios";
import { navigate } from "@reach/router";
import {
  Card,
  Input,
  Typography,
  Button,
  message,
  // Radio,
  // TimePicker,
  // Menu,
  // Dropdown,
} from "antd";
import {
  UserOutlined,
  // VideoCameraOutlined,
  NumberOutlined,
  PushpinOutlined,
} from "@ant-design/icons";
import "antd/dist/antd.css";
import "./AddTeacher.css";
import { apiTeacherUrl, backendUrl, teachersList } from "../../utils/utils";
import { Radio, Select } from "antd/lib";

const { Title } = Typography;

export class AddTeacher extends Component {
  constructor(props) {
    super(props);

    this.state = {
      teacherName: "",
      shortName: "",
      designation: "",
      mode: "add",
      teacherList: [],
      teacherSelected: {},
      selectedFaculty: [],
      selectedYears: [],
    };
  }
  ValidateFields = () => {
    if (this.state.teacherName === "") {
      message.error("Enter Teacher Name");
      return false;
    }
    if (this.state.shortName === "") {
      message.error("Enter Teacher Short Name");
      return false;
    }
    return true;
  };

  ValidateFieldsB = () => {
    if (this.state.teacherSelected.teacherName === "") {
      message.error("Enter Teacher Name");
      return false;
    }
    if (this.state.teacherSelected.shortName === "") {
      message.error("Enter Teacher Short Name");
      return false;
    }
    if (this.state.selectedYears.length === 0) {
      message.error("Enter Teacher Short Name");
      return false;
    }
    return true;
  };

  faculty = [
    "Department of Electronics and Computer Engineering",
    "Department of Electrical Engineering",
    "Department of Civil Engineering",
    "Department of Mechanical and Aerospace Engineering",
    "Department of Applied Sciences and Humanities",
    "Department of Architecture",
    "Department of Chemical Engineering",
  ];

  async fetchTeacherList() {
    const { data: res } = await axios.get(apiTeacherUrl + `/`);
    this.setState({ teacherList: res.data }, () =>
      console.log(this.state.teacherList)
    );
  }

  async modeChange(value) {
    if (this.state.mode != value)
      this.setState({
        teacherName: "",
        shortName: "",
        designation: "",
        teacherSelected: {},
      });
    this.setState({ mode: value });
    if (value == "edit" || value == "delete") {
      if (this.state.teacherList.length == 0) {
        await this.fetchTeacherList();
      }
    }
  }

  editSelect(value) {
    const teacherSelected = this.state.teacherList.find((t) => t._id == value);
    this.setState({
      teacherSelected: teacherSelected,
      teacherName: teacherSelected.teacherName,
      shortName: teacherSelected.shortName,
      designation: teacherSelected.designation,
    });
  }

  render() {
    const {
      mode,
      teacherList,
      teacherName,
      shortName,
      designation,
      selectedFaculty,
      selectedYears,
    } = this.state;
    const { teacherSelected } = this.state;
    const faculty = this.faculty;

    return (
      <div>
        <Card
          className="card"
          style={{ backgroundColor: "#F3F1FF", margin: "12px" }}
        >
          <Title className="input" level={3}>
            Add/Edit Teacher
          </Title>
          <Radio.Group
            defaultValue={"add"}
            options={[
              { label: "Add", value: "add" },
              { label: "Edit", value: "edit" },
              { label: "Delete", value: "delete" },
            ]}
            onChange={async (val) => await this.modeChange(val.target.value)}
            optionType="button"
          />
          <br />
          <br />
          {mode == "edit" || mode == "delete" ? (
            <div>
              <Select
                showSearch
                optionFilterProp="label"
                style={{ width: 400 }}
                placeholder={"Search for teacher"}
                options={teacherList.map((tObj) => {
                  return { label: tObj.teacherName, value: tObj._id };
                })}
                onChange={(val) => this.editSelect(val)}
              ></Select>
              {Object.keys(teacherSelected).length > 0 ? (
                <div>
                  <Input
                    className="input"
                    size="large"
                    placeholder="Teacher Name"
                    value={teacherSelected.teacherName}
                    prefix={<UserOutlined />}
                    onChange={(e) =>
                      this.setState({
                        teacherSelected: {
                          _id: teacherSelected._id,
                          teacherName: e.target.value,
                          shortName: teacherSelected.shortName,
                          designation: teacherSelected.designation,
                        },
                      })
                    }
                  />
                  <Input
                    className="input"
                    size="large"
                    placeholder="Short Name"
                    prefix={<NumberOutlined />}
                    value={teacherSelected.shortName}
                    onChange={(e) =>
                      this.setState({
                        teacherSelected: {
                          _id: teacherSelected._id,
                          teacherName: teacherSelected.teacherName,
                          shortName: e.target.value,
                          designation: teacherSelected.designation,
                        },
                      })
                    }
                  />
                  <Input
                    className="input"
                    size="large"
                    placeholder="Designation"
                    prefix={<PushpinOutlined />}
                    value={teacherSelected.designation}
                    onChange={(e) =>
                      this.setState({
                        teacherSelected: {
                          _id: teacherSelected._id,
                          teacherName: teacherSelected.teacherName,
                          shortName: teacherSelected.shortName,
                          designation: e.target.value,
                        },
                      })
                    }
                  />

                  {mode == "edit" ? (
                    <Button
                      type="primary"
                      className="input"
                      style={{ backgroundColor: "#141414" }}
                      onClick={async () => {
                        console.log(teacherName, shortName, designation);

                        if (this.ValidateFieldsB()) {
                          axios.post(
                            apiTeacherUrl +
                              `/edit/${this.state.teacherSelected._id.toString()}`,
                            {
                              teacherName:
                                this.state.teacherSelected.teacherName,
                              shortName: this.state.teacherSelected.shortName,
                              designation:
                                this.state.teacherSelected.designation,
                            }
                          );
                          message.success("Teacher updated Sucessfully");
                          window.location.reload();
                        } else {
                          message.error("Teacher Cannot be updated");
                        }
                      }}
                    >
                      Submit
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      className="input"
                      style={{ backgroundColor: "#aa1515" }}
                      onClick={async () => {
                        axios.post(
                          apiTeacherUrl +
                            `/delete/${this.state.teacherSelected._id.toString()}`,
                          {}
                        );
                        message.success("Teacher deleted Sucessfully");
                        window.location.reload();
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              ) : (
                <div />
              )}
            </div>
          ) : (
            <div>
              <Input
                className="input"
                size="large"
                placeholder="Teacher Name"
                value={teacherName}
                prefix={<UserOutlined />}
                onChange={(e) => this.setState({ teacherName: e.target.value })}
              />
              <Input
                className="input"
                size="large"
                placeholder="Short Name"
                prefix={<NumberOutlined />}
                value={shortName}
                onChange={(e) => this.setState({ shortName: e.target.value })}
              />
              <Input
                className="input"
                size="large"
                placeholder="Designation"
                prefix={<PushpinOutlined />}
                value={designation}
                onChange={(e) => this.setState({ designation: e.target.value })}
              />
              <Select
                showSearch
                className="input"
                placeholder="Select faculty"
                options={faculty.map((f) => ({
                  label: f,
                  value: f,
                }))}
                onChange={(value) => this.setState({ selectedFaculty: value })}
              />

              <Select
                mode="multiple"
                className="input"
                placeholder="Select years"
                value={this.state.selectedYears}
                onChange={(value) => this.setState({ selectedYears: value })}
                options={[...Array(5).keys()].map((i) => ({
                  label: i + 1,
                  value: i + 1,
                }))}
              />

              <Button
                type="primary"
                className="input"
                style={{ backgroundColor: "#141414" }}
                onClick={async (e) => {
                  // console.log(teacherName, shortName, designation, selectedFaculty, selectedYears);

                  if (this.ValidateFields() === true) {
                    const { data } = await axios.post(apiTeacherUrl + `/add`, {
                      teacherName: teacherName,
                      shortName: shortName,
                      designation: designation,
                      faculty: selectedFaculty,
                      years: selectedYears,
                    });
                    this.setState({
                      teacherName: "",
                      shortName: "",
                      designation: "",
                    });
                    if (data.status) {
                      message.success("Teacher Added Sucessfully");
                      e.preventDefault();
                    } else {
                      message.error("Teacher Cannot be Added");
                    }
                  } else {
                    message.error("Teacher Cannot be Added");
                  }
                }}
              >
                Submit
              </Button>
            </div>
          )}

          <br />
          <br />
        </Card>
      </div>
    );
  }
}

export default AddTeacher;
