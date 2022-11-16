import { useCallback, useEffect, useState } from "react";
import { Item, Icon, Pagination, Sidebar, Segment, Form, Select, Message } from 'semantic-ui-react';
import { DateRange } from 'react-date-range';
import { toast } from "react-toastify";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import * as dates from 'date-arithmetic';
import { MealService } from "services/mealServices";

function CaloriePerDay({ user }) {
    dayjs.extend(customParseFormat)
    const [stats, setStats] = useState([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(0);

    const [filter, showFilter] = useState(false);

    const [limits, setLimits] = useState({});
    const [spendWarning, showSpendWarning] = useState(false);

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

    const checkLimits = useCallback((user) => {
        var today = new Date();
        var data = {
            email: user?.email,
            before: dayjs(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)).format('YYYY-MM-DD'),
            after: dayjs(dates.startOf(today, 'month')).format('YYYY-MM-DD')
        };
        let limits = (new MealService()).post("/limits", data);
        limits.then(response => {
            setLimits(response.data);
            if (response.data?.cost >= response.data.spendLimit) {
                showSpendWarning(true);
            }
        })
    }, []);

    const loadStats = useCallback((user, setStats, page, filterCreated) => {
        var filter = { email: user?.email, page: page - 1, limit: 10 }
        filter = filterCreatedDays(filter, filterCreated);
        let res = (new MealService()).post("/stats", filter);
        res.then(response => {
            if (response.status === 200) {
                setStats(response.data.stats.results);
                setPages(response.data.stats.total / 10);
                checkLimits(user);
            }
            else {
                toast.error("Unable to load statistics!", {
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
    }, [filterCreatedDays, checkLimits]);

    useEffect(() => {
        if (user?.email !== undefined) {
            loadStats(user, setStats, page, filterCreated)
        }
    }, [user, loadStats, setStats, page, filterCreated]);

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
                            label={{ children: 'Date Range', htmlFor: 'created', className: "mr-2" }}
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
                    {
                        spendWarning &&
                        <Message negative
                            className="mt-10"
                            onDismiss={() => showSpendWarning(false)}
                            header='You spent more!'
                            content={`You spent $${limits.cost - limits.spendLimit} more than your monthly limit`}
                        />
                    }
                    <Item.Group className="mt-0">
                        {
                            stats?.map(meal => {
                                return (
                                    <Item
                                        className={user.calorieLimit <= meal.calorie ? "meal-container admin-container" : "meal-container user-container"}
                                        key={meal.date}
                                    >
                                        <Item.Content>
                                            <Item.Header>{dayjs(meal.date, "DD-MM-YYYY").format('MMM D, YYYY')}</Item.Header>
                                            <Item.Meta>
                                                <div>
                                                    <b className={Number(limits.calorieLimit) <= Number(meal.calorie) ? "text-danger" : "text-success"}>
                                                        {meal.calorie}
                                                    </b> calories
                                                </div>
                                                <div><b>${meal.price}</b></div>
                                            </Item.Meta>
                                            <Item.Extra>
                                                <div className="text-right">
                                                    You had <b>{meal.count}</b> food items
                                                </div>
                                            </Item.Extra>
                                        </Item.Content>
                                    </Item>
                                )
                            })
                        }
                    </Item.Group>
                </Sidebar.Pusher>
            </Sidebar.Pushable>
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
        </div>
    )
}

export default CaloriePerDay