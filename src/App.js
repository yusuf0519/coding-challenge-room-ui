import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import "./App.css";

const App = () => {
  const [buildingWithRooms, setBuildingWithRooms] = useState({});
  const [errorTemperature, setErrorTemperature] = useState("");
  const [temperature, setTemperature] = useState(null);
  const selectedBuildingId = useRef(0);
  const [show, setShow] = useState(false);
  const [addEditRoomModalShow, setAddEditRoomModalShow] = useState(false);
  const [editRoomProperties, setEditRoomProperties] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedRoomForEdit = useRef(0);
  const handleClose = () => setShow(false);
  const handleShow = () => {
    selectedBuildingId.current = 0;
    setTemperature(null);
    setErrorTemperature("");
    setShow(true);
  };

  const handleAddEditRoomModalClose = () => setAddEditRoomModalShow(false);

  const handleRoomModalShow = (isEditing, item, roomId) => {
    setIsSubmitting(false);
    selectedRoomForEdit.current = 0;
    if (isEditing) {
      selectedRoomForEdit.current = roomId;
      setEditRoomProperties(item);
    } else {
      setEditRoomProperties({});
    }

    setAddEditRoomModalShow(true);
  };

  const handleTemperature = (value) => {
    if (value >= 10 && value <= 40) {
      setTemperature(value);
      setErrorTemperature("");
    } else {
      setErrorTemperature("Please enter temperature between 10 - 40");
    }
  };

  const getAllRooms = async () => {
    axios({
      url: "http://localhost:3000/buildings",
      method: "GET",
      headers: {},
    })
      .then((res) => {
        setBuildingWithRooms(res?.data?.items);
      })

      .catch((err) => {
        alert(err?.message);
      });
  };

  const handleSubmitTemperature = () => {
    const buildingId = selectedBuildingId.current;
    if (buildingId !== 0) {
      axios
        .post(`http://localhost:3000/buildings`, {
          temperature: temperature,
          id: buildingId,
        })
        .then((response) => {
          getAllRooms();
        });

      handleClose();
    } else {
      alert("Something went wrong, please try again later");
    }
  };

  const handleEditChangesForAddEditRoom = (typeOfField, value) => {
    switch (typeOfField) {
      case "occupant":
        setEditRoomProperties({
          ...editRoomProperties,
          occupant: value,
        });
        break;
      case "currentTemperature":
        setEditRoomProperties({
          ...editRoomProperties,
          currentTemperature: +value,
        });
        break;
    }
  };

  const handleSubmitAddEditRoom = () => {
    setIsSubmitting(true);
    const { currentTemperature, occupant } = editRoomProperties;
    if (currentTemperature < 10 || currentTemperature > 40) {
      setEditRoomProperties({
        ...editRoomProperties,
        currentTemperature: "",
      });
    } else {
      if (selectedRoomForEdit.current > 0) {
        axios
          .post(`http://localhost:3000/buildings/addRoom`, {
            buildingId: selectedBuildingId.current,
            room: editRoomProperties,
            roomId: selectedRoomForEdit.current,
          })
          .then((response) => {
            getAllRooms();
          });
      } else {
        axios
          .post(`http://localhost:3000/building/room`, {
            buildingId: selectedBuildingId.current,
            room: editRoomProperties,
          })
          .then((response) => {
            getAllRooms();
          });
      }
      handleAddEditRoomModalClose();
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    getAllRooms();
  }, []);

  const removeRoom = (id, buildingId) => {
    let getAnswerFromUser = window.confirm(
      `Are you sure you want to remove room ${id} ?`
    );
    if (getAnswerFromUser) {
      axios
        .post(`http://localhost:3000/removeRoom`, {
          buildingId: buildingId,
          id: id,
        })
        .then((response) => {
          getAllRooms();
        });
    }
  };

  return (
    <>
      <div className="m-3 p-2">
        <h2 className="main-heading mb-3">Building Controls</h2>
        <div className="card">
          <div className="card-body">
            {buildingWithRooms?.length &&
              buildingWithRooms.map((building, index) => {
                return (
                  <>
                    <div className="row" key={building.id}>
                      <h3>Building Name: {building.buildingName}</h3>
                      <div className="row align-items-center mb-3">
                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                          <h6 className="mb-0">
                            Requested Temperature ={" "}
                            {building.requestedTemperature}
                            &deg;C
                          </h6>
                        </div>
                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 d-flex justify-content-sm-end">
                          <Button
                            variant="primary"
                            onClick={() => {
                              handleShow();
                              selectedBuildingId.current = building.buildingId;
                            }}
                          >
                            Change Temperature for = {building.buildingName}
                          </Button>
                        </div>
                      </div>

                      <div className="card">
                        <div className="card-body row">
                          <div className="row mb-2">
                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                              <h5>All Rooms inside: {building.buildingName}</h5>
                            </div>
                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 d-flex justify-content-sm-end">
                              <button
                                onClick={() => {
                                  selectedBuildingId.current =
                                    building.buildingId;
                                  handleRoomModalShow(false, {});
                                }}
                                className="btn btn-success text-light"
                              >
                                Add Room
                              </button>
                            </div>
                          </div>
                          {building?.rooms?.map((item, index) => {
                            return (
                              <div
                                className="card col-xl-2 col-lg-2 col-md-6 col-sm-12 room-cards mb-2"
                                key={item.roomId}
                              >
                                <div className="card-header">
                                  <div>
                                    <h6>Room Number: {item.roomId}</h6>
                                  </div>
                                </div>
                                <div className="card-body">
                                  <h5 className="card-title">
                                    Occupant: {item.occupant}
                                  </h5>
                                  <p className="card-text">
                                    Current Temperature:
                                    {item.currentTemperature}
                                  </p>
                                  <p className="card-text">
                                    If Cooling: {item.ifCooling ? "Yes" : "No"}
                                  </p>
                                  <p className="card-text">
                                    If Heating: {item.ifHeating ? "Yes" : "No"}
                                  </p>
                                  <div className="row">
                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                                      <Button
                                        className="text-light"
                                        variant="info"
                                        onClick={() => {
                                          selectedBuildingId.current =
                                            building.buildingId;
                                          handleRoomModalShow(
                                            true,
                                            item,
                                            item.roomId
                                          );
                                        }}
                                      >
                                        Edit
                                      </Button>
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                                      <Button
                                        variant="danger"
                                        onClick={() => {
                                          removeRoom(
                                            item.roomId,
                                            building.buildingId
                                          );
                                        }}
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </>
                );
              })}
          </div>
        </div>
      </div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Change Temperature for building</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Temperature</Form.Label>
              <Form.Control
                type="number"
                onChange={(e) => handleTemperature(e.target.value)}
                placeholder="Temperature between 10 to 40"
                className="shadow-none border-none"
              />
              {!!errorTemperature?.length && (
                <p className="text-danger">{errorTemperature}</p>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="primary"
            disabled={errorTemperature?.length || !temperature}
            onClick={handleSubmitTemperature}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={addEditRoomModalShow} onHide={handleAddEditRoomModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {Object.keys(editRoomProperties).length ? "Edit Room" : "Add Room"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Occupant</Form.Label>
              <Form.Control
                type="text"
                onChange={(e) =>
                  handleEditChangesForAddEditRoom("occupant", e.target.value)
                }
                placeholder="Enter Name"
                value={editRoomProperties?.occupant}
                className="shadow-none border-none"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Temperature</Form.Label>
              <Form.Control
                type="number"
                onChange={(e) =>
                  handleEditChangesForAddEditRoom(
                    "currentTemperature",
                    e.target.value
                  )
                }
                placeholder="Current Temperature"
                value={editRoomProperties?.currentTemperature}
                className="shadow-none border-none"
                required
              />
              {!editRoomProperties?.currentTemperature?.length &&
                isSubmitting && (
                  <p className="text-danger">
                    Temperature is required and between 10 - 40
                  </p>
                )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleAddEditRoomModalClose}>
            Close
          </Button>
          <Button
            variant="primary"
            disabled={!editRoomProperties?.occupant?.length}
            onClick={handleSubmitAddEditRoom}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default App;
