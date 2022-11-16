import { ToastContainer } from 'react-toastify';
import { Tab } from 'semantic-ui-react';
import AdminStats from './AdminStats';
import CaloriePerDay from './CaloriePerDay';
import ListMeals from './ListMeals';

function CustomTab({ user }) {

    var userpanes = [
        {
            menuItem: { key: 'utensils', icon: 'utensils', content: 'Meals' },
            render: () => {
                return (
                    <Tab.Pane className='overflow-y-scroll'>
                        <ListMeals user={user} />
                    </Tab.Pane>
                )
            },
        },
        {
            menuItem: { key: 'chart', icon: 'chart bar outline', content: 'Statistics' },
            render: () => {
                return (
                    <Tab.Pane className='overflow-y-scroll'>
                        <CaloriePerDay user={user} />
                    </Tab.Pane>
                )
            },
        },
        {
            menuItem: { key: 'cog', icon: 'cog', content: 'Settings' },
            render: () => {
                return (<Tab.Pane className='overflow-y-scroll'></Tab.Pane>)
            },
        },
    ]
    var adminpanes = [
        {
            menuItem: { key: 'utensils', icon: 'utensils', content: 'All Meals' },
            render: () => {
                return (
                    <Tab.Pane className='overflow-y-scroll'>
                        <ListMeals user={user} />
                    </Tab.Pane>
                )
            },
        },
        {
            menuItem: { key: 'chart', icon: 'chart bar outline', content: 'Statistics' },
            render: () => {
                return (
                    <Tab.Pane className='overflow-y-scroll'>
                        <AdminStats user={user} />
                    </Tab.Pane>
                )
            },
        },
        {
            menuItem: { key: 'users', icon: 'users', content: 'Users' },
            render: () => {
                return (<Tab.Pane className='overflow-y-scroll'></Tab.Pane>)
            },
        },
    ]
    return (
        <>
            <ToastContainer
                position="bottom-center"
                autoClose={5000}
                hideProgressBar
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <Tab
                panes={user?.role === "admin" ? adminpanes : userpanes}
                className="border-radius-25"
            />
        </>

    )
}

export default CustomTab;