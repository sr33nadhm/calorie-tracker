import { useCallback, useEffect, useState } from "react";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { toast } from "react-toastify";

import * as dates from 'date-arithmetic';
import { UserService } from "services/userServices";
import { Grid, Segment, Card, Item } from 'semantic-ui-react';
import { MealService } from "services/mealServices";

function AdminStats({ user }) {
    dayjs.extend(customParseFormat);

    const [thisWeekData, setThisWeekData] = useState([]);
    const [prevWeekData, setPrevWeekData] = useState([]);

    const [thisWeekDates, setThisWeekDates] = useState({});
    const [prevWeekDates, setPrevWeekDates] = useState({});

    const [thisWeekCount, setThisWeekCount] = useState({});
    const [prevWeekCount, setPrevWeekCount] = useState({});

    const loadThisWeekData = useCallback((user) => {
        var today = new Date();
        var last7days = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        var data = {
            email: user?.email,
            before: dayjs(dates.endOf(today, 'day')).format("YYYY-MM-DD"),
            after: dayjs(dates.startOf(last7days, 'day')).format("YYYY-MM-DD"),
        };

        let stats = (new UserService()).post("/stats", data);
        stats.then(response => {
            if (response.status === 200) {
                setThisWeekData(response.data?.stats?.results);
                setThisWeekDates({
                    before: dayjs(dates.endOf(today, 'day')),
                    after: dayjs(dates.startOf(last7days, 'day'))
                });
            }
            else {
                toast.error("Unable to load statistics for this week", {
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

        let count = (new MealService()).post("/user-stats", data);
        count.then(response => {
            if (response.status === 200) {
                setThisWeekCount(response.data?.stats);
            }
            else {
                toast.error("Failed to load statistics for this week", {
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

    }, [setThisWeekData, setThisWeekDates, setThisWeekCount]);

    const loadPrevWeekData = useCallback((user) => {
        var today = new Date();
        var last7days = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        var last14days = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14);
        var data = {
            email: user?.email,
            before: dayjs(dates.endOf(last7days, 'day')).format("YYYY-MM-DD"),
            after: dayjs(dates.startOf(last14days, 'day')).format("YYYY-MM-DD"),
        };

        let stats = (new UserService()).post("/stats", data);
        stats.then(response => {
            if (response.status === 200) {
                setPrevWeekData(response.data?.stats?.results);
                setPrevWeekDates({
                    before: dayjs(dates.endOf(last7days, 'day')),
                    after: dayjs(dates.startOf(last14days, 'day'))
                });
            }
            else {
                toast.error("Unable to load statistics for last week", {
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

        let count = (new MealService()).post("/user-stats", data);
        count.then(response => {
            if (response.status === 200) {
                setPrevWeekCount(response.data?.stats);
            }
            else {
                toast.error("Failed to load statistics for this week", {
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
    }, [setPrevWeekData, setPrevWeekDates, setPrevWeekCount]);

    useEffect(() => {
        if (user?.email !== undefined) {
            loadThisWeekData(user);
            loadPrevWeekData(user);
        }
    }, [user, loadThisWeekData, loadPrevWeekData]);

    return (
        <div>
            <Grid columns={1}>
                <Grid.Column>
                    <Segment className="p-0">
                        <Card className="admin-stats-card">
                            <Card.Content>
                                <Card.Header className="d-flex">
                                    <div>This Week</div>
                                    <div>{thisWeekCount.totalCal} cal</div>
                                </Card.Header>
                                <Card.Meta className="d-flex">
                                    <div>
                                        {
                                            dayjs(thisWeekDates.after, "DD-MM-YYYY").format('MMM D, YYYY') +
                                            " to " +
                                            dayjs(thisWeekDates.before, "DD-MM-YYYY").format('MMM D, YYYY')
                                        }
                                    </div>
                                    <div>
                                        {Math.round((thisWeekCount.totalCal / thisWeekCount.totalUsers + Number.EPSILON) * 100) / 100} cal/user
                                    </div>
                                </Card.Meta>
                                <Card.Description>
                                    {
                                        thisWeekData?.map(meal => {
                                            return (
                                                <Item
                                                    className="admin-container meal-container"
                                                    key={meal.date}
                                                >
                                                    <Item.Content>
                                                        <Item.Meta>
                                                            <div>
                                                                <b>{meal.name}</b>
                                                            </div>
                                                            <div className="text-dark">
                                                                {meal.email}
                                                            </div>
                                                            <div>
                                                                <b>
                                                                    {Math.round((meal.totalCal / 7 + Number.EPSILON) * 100) / 100}
                                                                </b> calories per day
                                                            </div>
                                                        </Item.Meta>
                                                        <Item.Extra>
                                                        </Item.Extra>
                                                    </Item.Content>
                                                </Item>
                                            )
                                        })
                                    }
                                </Card.Description>
                                <Card.Meta className="d-flex">
                                    <div>
                                        {thisWeekCount.totalEntries} entries
                                    </div>
                                </Card.Meta>
                            </Card.Content>
                            <Card.Content extra>

                            </Card.Content>
                        </Card>
                    </Segment>
                </Grid.Column>
                <Grid.Column>
                    <Segment className="p-0">
                        <Card className="admin-stats-card">
                            <Card.Content>
                                <Card.Header className="d-flex">
                                    <div>Last Week</div>
                                    <div>{prevWeekCount.totalCal} cal</div>
                                </Card.Header>
                                <Card.Meta className="d-flex">
                                    <div>
                                        {
                                            dayjs(prevWeekDates.after, "DD-MM-YYYY").format('MMM D, YYYY') +
                                            " to " +
                                            dayjs(prevWeekDates.before, "DD-MM-YYYY").format('MMM D, YYYY')
                                        }
                                    </div>
                                    <div>
                                        {Math.round((prevWeekCount.totalCal / prevWeekCount.totalUsers + Number.EPSILON) * 100) / 100} cal/user
                                    </div>
                                </Card.Meta>
                                <Card.Description>
                                    {
                                        prevWeekData?.map(meal => {
                                            return (
                                                <Item
                                                    className="user-container meal-container"
                                                    key={meal.date}
                                                >
                                                    <Item.Content>
                                                        <Item.Meta>
                                                            <div>
                                                                <b>{meal.name}</b>
                                                            </div>
                                                            <div className="text-dark">
                                                                {meal.email}
                                                            </div>
                                                            <div>
                                                                <b>
                                                                    {Math.round((meal.totalCal / 7 + Number.EPSILON) * 100) / 100}
                                                                </b> calories per day
                                                            </div>
                                                        </Item.Meta>
                                                        <Item.Extra>
                                                        </Item.Extra>
                                                    </Item.Content>
                                                </Item>
                                            )
                                        })
                                    }
                                </Card.Description>
                                <Card.Meta className="d-flex">
                                    <div>
                                        {prevWeekCount.totalEntries} entries
                                    </div>
                                </Card.Meta>
                            </Card.Content>
                            <Card.Content extra>

                            </Card.Content>
                        </Card>
                    </Segment>
                </Grid.Column>
            </Grid>
        </div>
    )
}

export default AdminStats