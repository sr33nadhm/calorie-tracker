import { Formik } from 'formik';
import * as Yup from 'yup';
import { Col, Form, Row, Modal, Container } from 'react-bootstrap';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import TextField from "@material-ui/core/TextField";
import { MealService } from 'services/mealServices';
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useCallback, useState } from 'react';
import { UserService } from 'services/userServices';
import { Form as SUIForm, Select } from "semantic-ui-react";

function CustomModal({ modal, showModal, user, defaults, refreshData, view = "add" }) {

    const [readOnly, setReadOnly] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(view === "edit" ? defaults.user?.email : "");

    const [deleteModal, showDeleteModal] = useState(false);

    const mealSchema = Yup.object().shape({
        name: Yup.string().required("Name is required"),
        calorie: Yup.number().required("Please specify the calorie").min(1, "Please enter a valid number"),
        price: Yup.number().required("Please specify price for meal").min(1, "Please specify price for meal"),
        date: Yup.string().required("Date is required"),
    });

    const loadUsers = useCallback((user) => {
        var filter = { email: user?.email }
        let res = (new UserService()).post("/list", filter);
        res.then(response => {
            if (response.status === 200) {
                var users = response.data?.map(user => {
                    return { key: user.email, text: user.email, value: user.email }
                })
                setUsers(users);
            }
            else {
                toast.error("Unable to load users!", {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
        })
    }, []);

    useEffect(() => {
        if (user.role === "admin") {
            loadUsers(user);
        }
        else {
            setReadOnly(view === "edit");
        }
    }, [view, user, loadUsers, setReadOnly])


    const addNewMeal = (values) => {
        let data = {
            name: values.name,
            calorie: values.calorie,
            price: values.price,
            date: values.date.toISOString(),
            email: user.role === "admin" ? selectedUser : user.email
        }
        if (selectedUser !== "" || user.role === "user") {
            let res = (new MealService()).put("", data);
            res.then(response => {
                if (response.status === 201) {
                    showModal(false);
                    refreshData();
                    toast.success("Added the meal!", {
                        position: "top-center",
                        autoClose: 5000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                } else {
                    toast.error("Unable to add the meal!", {
                        position: "top-center",
                        autoClose: 5000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                }
            })
        }
        else {
            toast.error("Please choose the user", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    }

    const editMeal = (values) => {
        let data = {
            name: values.name,
            calorie: values.calorie,
            price: values.price,
            date: new Date(values.date).toISOString(),
            email: defaults.user?.email
        }

        let res = (new MealService()).patch("/" + defaults.id, data);
        res.then(response => {
            if (response.status === 200) {
                showModal(false);
                refreshData();
                toast.success("Edited the meal!", {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            } else {
                toast.error("Unable to edit the meal!", {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
        })

    }

    const promptDelete = (meal) => {
        console.log(defaults);
        showModal(false);
        showDeleteModal(true);
    }

    const deleteMeal = () => {
        let res = (new MealService()).delete("/" + defaults.id);
        res.then(response => {
            showDeleteModal(false);
            if (response.status === 200) {
                showModal(false);
                refreshData();
                toast.success("Removed the meal!", {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            } else {
                toast.error("Unable to remove the meal!", {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
        })
    }

    return (
        <div>
            <Modal show={modal} onHide={() => { showModal(false) }}>
                <Modal.Header closeButton={true} className='justify-content-end'>
                    {view === "add" ? "Add Meal Details" : "Meal Details"}
                </Modal.Header>
                <Modal.Body>
                    {
                        user.role === "admin" &&
                        <SUIForm.Group>
                            <SUIForm.Field
                                className='sui-field'
                                control={Select}
                                options={users}
                                label={{ children: 'Select User ', htmlFor: 'user', className: "mr-2" }}
                                search
                                clearable
                                searchInput={{ id: 'user' }}
                                name="user"
                                value={view === "edit" ? defaults.user?.email : selectedUser}
                                onChange={(_, { value }) => {
                                    console.log(value)
                                    setSelectedUser(value);
                                }}
                                placeholder="Select user"
                                disabled={view === "edit"}

                            />
                        </SUIForm.Group>}
                    <Formik
                        validationSchema={mealSchema}
                        onSubmit={view === "add" ? addNewMeal : editMeal}
                        initialValues={defaults}
                        enableReinitialize
                    >
                        {addMealProps => (
                            <div className='amenity-container'>
                                <Form noValidate onSubmit={addMealProps.handleSubmit}>
                                    <Row className="mb-3">
                                        <Form.Group as={Col} md="12">
                                            <Form.Label>Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                className='hide-arrows'
                                                name="name"
                                                value={addMealProps.values.name}
                                                onChange={addMealProps.handleChange('name')}
                                                onBlur={addMealProps.handleBlur}
                                                isInvalid={addMealProps.errors.name && addMealProps.touched.name}
                                                placeholder="Eg: Pizza"
                                                disabled={readOnly}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {addMealProps.errors.name}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Row>
                                    <Row className="mb-3">
                                        <Form.Group as={Col} md="12">
                                            <Form.Label>Calories</Form.Label>
                                            <Form.Control
                                                type="number"
                                                className='hide-arrows'
                                                name="calorie"
                                                value={addMealProps.values.calorie}
                                                onChange={addMealProps.handleChange('calorie')}
                                                onBlur={addMealProps.handleBlur}
                                                isInvalid={addMealProps.errors.calorie && addMealProps.touched.calorie}
                                                placeholder="Eg: 500"
                                                disabled={readOnly}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {addMealProps.errors.calorie}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Row>
                                    <Row className="mb-3">
                                        <Form.Group as={Col} md="12">
                                            <Form.Label>Price</Form.Label>
                                            <Form.Control
                                                type="number"
                                                className='hide-arrows'
                                                name="price"
                                                value={addMealProps.values.price}
                                                onChange={addMealProps.handleChange('price')}
                                                onBlur={addMealProps.handleBlur}
                                                isInvalid={addMealProps.errors.price && addMealProps.touched.price}
                                                placeholder="Eg: 4"
                                                disabled={readOnly}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {addMealProps.errors.price}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Row>
                                    <Row className="mb-3">
                                        <Form.Group as={Col} md="12">
                                            <Form.Label>Time</Form.Label>
                                            <Container>
                                                <LocalizationProvider dateAdapter={AdapterMoment}>
                                                    <DateTimePicker
                                                        renderInput={(props) => <TextField {...props} className="form-control" />}
                                                        label=""
                                                        value={addMealProps.values.date}
                                                        onChange={(newValue) => {
                                                            addMealProps.setFieldValue("date", newValue);
                                                        }}
                                                        disabled={readOnly}
                                                        disableFuture={true}
                                                    />
                                                </LocalizationProvider>
                                            </Container>
                                            <Form.Control.Feedback type="invalid">
                                                {addMealProps.errors.date}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Row>
                                    <Row className='mx-2 my-2'>
                                        {
                                            view === "add" &&
                                            < button
                                                type="submit"
                                                className='btn btn-success'
                                                onClick={addMealProps.handleSubmit}
                                                disabled={(!addMealProps.isValid)}
                                            >
                                                Add
                                            </button>
                                        }{
                                            user.role === "admin" &&
                                            <div className='manage-meals-btns'>
                                                {
                                                    (view === "edit" && !readOnly) &&
                                                    < button
                                                        type="submit"
                                                        className='btn btn-success w-inherit'
                                                        onClick={addMealProps.handleSubmit}
                                                        disabled={(!addMealProps.isValid) || readOnly}
                                                    >
                                                        Save
                                                    </button>
                                                }
                                                {
                                                    (view === "edit" && !readOnly) &&
                                                    < button
                                                        type="button"
                                                        className='btn btn-danger w-inherit'
                                                        onClick={promptDelete}
                                                    >
                                                        Delete
                                                    </button>
                                                }
                                            </div>
                                        }
                                    </Row>
                                </Form>
                            </div>
                        )}
                    </Formik>
                </Modal.Body>
            </Modal>
            <Modal show={deleteModal} onHide={() => { showDeleteModal(false) }}>
                <Modal.Header closeButton={true} className='justify-content-end'>
                    Confirm delete
                </Modal.Header>
                <Modal.Body>
                    Do you really want to remove {defaults.name} for {defaults.user?.name}?
                    <div className='manage-meals-btns'>
                        < button
                            type="button"
                            className='btn btn-danger w-inherit'
                            onClick={deleteMeal}
                        >
                            Yes
                        </button>
                        < button
                            type="button"
                            className='btn btn-success w-inherit'
                            onClick={() => showDeleteModal(false)}
                        >
                            No
                        </button>
                    </div>
                </Modal.Body>
            </Modal >
        </div >
    )
}

export default CustomModal;