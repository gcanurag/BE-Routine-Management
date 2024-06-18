import React, { useState, useEffect } from "react";
import axios from "axios";
import { navigate } from "@reach/router";
import {
  Card,
  Input,
  Typography,
  Button,
  message,
} from "antd";
import {
  UserOutlined,
  NumberOutlined,
  PushpinOutlined,
} from "@ant-design/icons";
import "antd/dist/antd.css";
import "./AddTeacher.css";
import { apiTeacherUrl, backendUrl, teachersList } from "../../utils/utils";
import { Radio, Select } from "antd/lib";

const { Title } = Typography;

const AddTeacher = () => {
  const [teacherName, setTeacherName] = useState("");
  const [shortName, setShortName] = useState("");
  const [designation, setDesignation] = useState("");
  const [faculty, setFaculty] = useState("");
  const [year, setYear] = useState("");
  const [mode, setMode] = useState("add");
  const [teacherList, setTeacherList] = useState([]);
  const [teacherSelected, setTeacherSelected] = useState({});
  const [faculties] = useState([
    "Department of Electronics and Computer Engineering",
    "Department of Electrical Engineering",
    "Department of Civil Engineering",
    "Department of Mechanical and Aerospace Engineering",
    "Department of Applied Sciences and Humanities",
    "Department of Architecture",
  ]);
  const [years] = useState([1, 2, 3, 4, 5]);

  const ValidateFields = () => {
    if (teacherName === "") {
      message.error("Enter Teacher Name");
      return false;
    }
    if (shortName === "") {
      message.error("Enter Teacher Short Name");
      return false;
    }
    return true;
  };

  const ValidateFieldsB = () => {
    if (teacherSelected.teacherName === "") {
      message.error("Enter Teacher Name");
      return false;
    }
    if (teacherSelected.shortName === "") {
      message.error("Enter Teacher Short Name");
      return false;
    }
    return true;
  }

  const fetchTeacherList = async () => {
    const { data: res } = await axios.get(apiTeacherUrl + `/`);
    setTeacherList(res.data);
  }

  const modeChange = async (value) => {
    if (mode !== value) {
      setTeacherName("");
      setShortName("");
      setDesignation("");
      setTeacherSelected({});
    }
    setMode(value);
    if (value === "edit" || value === "delete") {
      if (teacherList.length === 0) {
        await fetchTeacherList();
      }
    }
  }

  const editSelect = (value) => {
    const selectedTeacher = teacherList.find(t => t._id === value);
    setTeacherSelected(selectedTeacher);
    setTeacherName(selectedTeacher.teacherName);
    setShortName(selectedTeacher.shortName);
    setDesignation(selectedTeacher.designation);
  }

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
          options={[{ label: "Add", value: "add" }, { label: "Edit", value: "edit" }, { label: "Delete", value: "delete" }]}
          onChange={async val => await modeChange(val.target.value)}
          optionType="button"
        />
        <br />
        <br />
        {
          (mode === "edit" || mode === "delete") ?
            (<div>
              <Select
                showSearch
                optionFilterProp="label"
                style={{ width: 400 }}
                placeholder={"Search for teacher"}
                options={teacherList.map(tObj => { return { label: tObj.teacherName, value: tObj._id } })}
                onChange={val => editSelect(val)}
              >
              </Select>
              {
                (Object.keys(teacherSelected).length > 0) ? (<div>
                  <Input
                    className="input"
                    size="large"
                    placeholder="Teacher Name"
                    value={teacherSelected.teacherName}
                    prefix={<UserOutlined />}
                    onChange={e => setTeacherSelected({
                      ...teacherSelected,
                      teacherName: e.target.value
                    })}
                  />
                  <Input
                    className="input"
                    size="large"
                    placeholder="Short Name"
                    prefix={<NumberOutlined />}
                    value={teacherSelected.shortName}
                    onChange={e => setTeacherSelected({
                      ...teacherSelected,
                      shortName: e.target.value
                    })}
                  />
                  <Input
                    className="input"
                    size="large"
                    placeholder="Designation"
                    prefix={<PushpinOutlined />}
                    value={teacherSelected.designation}
                    onChange={e => setTeacherSelected({
                      ...teacherSelected,
                      designation: e.target.value
                    })}
                  />
                  {(mode === "edit") ? (<Button
                    type="primary"
                    className="input"
                    style={{ backgroundColor: "#141414" }}
                    onClick={async () => {
                      console.log(teacherName, shortName, designation);

                      if (ValidateFieldsB()) {
                        axios.post(apiTeacherUrl + `/edit/${teacherSelected._id.toString()}`, {
                          teacherName: teacherSelected.teacherName,
                          shortName: teacherSelected.shortName,
                          designation: teacherSelected.designation,
                        });
                        message.success("Teacher updated Successfully");
                        window.location.reload();
                      } else {
                        message.error("Teacher Cannot be updated");
                      }
                    }}
                  >
                    Submit
                  </Button>) :
                    (<Button
                      type="primary"
                      className="input"
                      style={{ backgroundColor: "#aa1515" }}
                      onClick={async () => {
                        axios.post(apiTeacherUrl + `/delete/${teacherSelected._id.toString()}`, {});
                        message.success("Teacher deleted Successfully");
                        window.location.reload();
                      }}
                    >
                      Delete
                    </Button>)}
                </div>)
                  : (<div />)
              }
            </div>) : (<div>
              <Input
                className="input"
                size="large"
                placeholder="Teacher Name"
                value={teacherName}
                prefix={<UserOutlined />}
                onChange={e => setTeacherName(e.target.value)}
              />
              <Input
                className="input"
                size="large"
                placeholder="Short Name"
                prefix={<NumberOutlined />}
                value={shortName}
                onChange={e => setShortName(e.target.value)}
              />
              <Input
                className="input"
                size="large"
                placeholder="Designation"
                prefix={<PushpinOutlined />}
                value={designation}
                onChange={e => setDesignation(e.target.value)}
              />
              <Select
                className="input"
                size="large"
                placeholder="Faculty"
                value={faculty}
                options={faculties.map(faculty => ({ label: faculty, value: faculty }))}
                onChange={value => setFaculty(value)}
              />
              <Select
                className="input"
                size="large"
                placeholder="Year"
                value={year}
                options={years.map(year => ({ label: year, value: year }))}
                onChange={value => setYear(value)}
              />
              <Button
                type="primary"
                className="input"
                style={{ backgroundColor: "#141414" }}
                onClick={async () => {
                  console.log(teacherName, shortName, designation);

                  if (ValidateFields() === true) {
                    axios.post(apiTeacherUrl + `/add`, {
                      teacherName: teacherName,
                      shortName: shortName,
                      designation: designation,
                      faculty: faculty,
                      year: year,
                    });
                    setTeacherName("");
                    setShortName("");
                    setDesignation("");
                    setFaculty("");
                    setYear("");
                    message.success("Teacher Added Successfully");
                    window.location.reload();
                  } else {
                    message.error("Teacher Cannot be Added");
                  }
                }}
              >
                Submit
              </Button>
            </div>)
        }
        <br />
        <br />
      </Card>
    </div>
  );
}

export default AddTeacher;
