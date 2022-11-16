import { useCallback, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { MealService } from "services/mealServices";
import { Item, Icon, Pagination, Sidebar, Segment, Select, Form } from 'semantic-ui-react';
import CustomModal from "./Modal";
import { DateRange } from 'react-date-range';
import dayjs from 'dayjs';
import * as dates from 'date-arithmetic';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

function ListMeals({ user }) {
    const [meals, setMeals] = useState([]);
    const dateFormat = { minute: 'numeric', hour: 'numeric', day: '2-digit', month: '2-digit', year: 'numeric' };

    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(0);

    const [addMeal, showAddMeal] = useState(false);
    const [editMeal, showEditMeal] = useState(false);

    const [selectedMeal, setSelectedMeal] = useState(false);

    const [filter, showFilter] = useState(false);

    const [filterCreated, setFilterCreated] = useState("");
    const [createdCalendar, showCreatedCalendar] = useState(false);
    const [createdDateRange, setCreatedDateRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
        }
    ]);

    const filterCreatedDays = useCallback((filter, filterCreated) => {
        var today = new Date();
        var last7days = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        var last14days = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14);

        if (filterCreated === "thisweek") {
            filter.before = dayjs(dates.endOf(today, 'day')).format("YYYY-MM-DD");
            filter.after = dayjs(dates.startOf(last7days, 'day')).format("YYYY-MM-DD");
        }
        else if (filterCreated === "lastweek") {
            filter.before = dayjs(dates.endOf(last7days, 'day')).format("YYYY-MM-DD");
            filter.after = dayjs(dates.startOf(last14days, 'day')).format("YYYY-MM-DD");
        }
        else if (filterCreated === "custom") {
            filter.before = dayjs(dates.endOf(createdDateRange[0].endDate, 'day')).format("YYYY-MM-DD");
            filter.after = dayjs(dates.startOf(createdDateRange[0].startDate, 'day')).format("YYYY-MM-DD");
        }
        return filter;
    }, [createdDateRange]);

    const loadMeals = useCallback((user, setMeals, page, filterCreated) => {
        var filter = { email: user?.email, page: page - 1, limit: 5 }
        filter = filterCreatedDays(filter, filterCreated);
        let res = (new MealService()).post("", filter);
        res.then(response => {
            if (response.status === 200) {
                setMeals(response.data.data.results);
                setPages(Math.ceil(response.data.data.total / 5));
            }
            else {
                toast.error(response.body?.message ? response.body?.message : "Unable to load meals", {
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
    }, [filterCreatedDays]);

    useEffect(() => {
        if (user?.email !== undefined) {
            loadMeals(user, setMeals, page, filterCreated)
        }
    }, [user, loadMeals, setMeals, page, filterCreated]);

    const modalDefaults = {
        name: "",
        calorie: 0,
        price: 0,
        date: new Date(),
    };

    const prepareEditMeal = (meal) => {
        setSelectedMeal(meal);
        showEditMeal(true);
    }

    const renderSideBar = () => {
        const createdOptions = [
            {
                key: 'This Week',
                text: 'This Week',
                value: 'thisweek',
            },
            {
                key: 'Last Week',
                text: 'Last Week',
                value: 'lastweek',
            },
            {
                key: 'Custom',
                text: 'Custom',
                value: 'custom',
            },
        ];

        return (
            <>
                <div className="custom-sidebar-body">
                    <div className='filter-header-row'>
                        <div className='section-title'>
                            All Filters
                        </div>
                    </div>
                    <Form.Group>
                        <Form.Field
                            className='custom-sidebar-label'
                            control={Select}
                            options={createdOptions}
                            label={{ children: 'Consumed Date', htmlFor: 'created', className: "mr-2" }}
                            search
                            clearable
                            searchInput={{ id: 'created' }}
                            name="created"
                            value={filterCreated}
                            onChange={(_, { value }) => {
                                if (value === "custom") {
                                    showCreatedCalendar(true);
                                }
                                else {
                                    setFilterCreated(value);
                                    showCreatedCalendar(false);
                                }
                            }}
                            placeholder="Select created date"
                        />
                    </Form.Group>
                    {
                        createdCalendar &&
                        <DateRange
                            className="mw-300"
                            editableDateInputs={true}
                            onChange={(item) => {
                                setCreatedDateRange([item.selection]);
                                showCreatedCalendar(false);
                                setFilterCreated("custom");
                            }}
                            moveRangeOnFirstSelection={false}
                            direction='vertical'
                            months={1}
                            ranges={createdDateRange}
                            weekdayDisplayFormat='EEEEE'
                            showDateDisplay={false}
                        />
                    }
                    <button
                        className="mask-button"
                        onClick={() => showFilter(false)}
                    >Apply</button>
                </div>
            </>
        );
    }

    return (
        <div>
            <CustomModal
                modal={addMeal}
                showModal={showAddMeal}
                user={user}
                defaults={modalDefaults}
                refreshData={() => loadMeals(user, setMeals, page, filterCreated)}
                view="add"
            />
            <CustomModal
                modal={editMeal}
                showModal={showEditMeal}
                user={user}
                defaults={selectedMeal}
                refreshData={() => loadMeals(user, setMeals, page, filterCreated)}
                view="edit"
            />
            <div className='filter-icon-row'>
                <Icon name='sliders horizontal' onClick={() => showFilter(true)} />
            </div>
            <Sidebar.Pushable as={Segment} className="custom-pushable">
                <Sidebar
                    className='custom-sidebar'
                    inverted="true"
                    direction='right'
                    animation='overlay'
                    icon='labeled'
                    onHide={() => {
                        showFilter(false)
                    }}
                    vertical="true"
                    visible={filter}
                >
                    {renderSideBar()}
                </Sidebar>
                <Sidebar.Pusher>
                    <Item.Group className="mt-0">
                        {
                            meals?.map(meal => {
                                return (
                                    <Item
                                        className={"meal-container " + user.role + "-container"}
                                        key={meal.id}
                                        onClick={() => prepareEditMeal(meal)}
                                    >
                                        <Item.Content>
                                            <Item.Header>{meal.name}</Item.Header>
                                            <Item.Meta>
                                                <div>{meal.calorie} calories</div>
                                                <div><b>${meal.price}</b></div>
                                            </Item.Meta>
                                            <Item.Extra>
                                                {
                                                    user.role === "user" ?
                                                        <div className="text-right">
                                                            {new Date(meal.date).toLocaleDateString("en-IN", dateFormat)}
                                                        </div>
                                                        :
                                                        <div className="row-justify">
                                                            <div>{meal.user.name}</div>
                                                            <div>{new Date(meal.date).toLocaleDateString("en-IN", dateFormat)}</div>
                                                        </div>
                                                }
                                            </Item.Extra>
                                        </Item.Content>
                                    </Item>
                                )
                            })
                        }
                    </Item.Group>
                </Sidebar.Pusher>
            </Sidebar.Pushable >
            {
                !filter &&
                <button
                    className='add-meal-btn'
                    onClick={() => showAddMeal(true)}
                > + </button>
            }

            <Pagination
                className="sticky-bottom"
                activePage={page}
                ellipsisItem={{ content: <Icon name='ellipsis horizontal' />, icon: true }}
                firstItem={{ content: <Icon name='angle double left' />, icon: true }}
                lastItem={{ content: <Icon name='angle double right' />, icon: true }}
                prevItem={{ content: <Icon name='angle left' />, icon: true }}
                nextItem={{ content: <Icon name='angle right' />, icon: true }}
                totalPages={pages}
                onPageChange={(e, data) => setPage(data.activePage)}
            />
        </div >

    )
}

export default ListMeals