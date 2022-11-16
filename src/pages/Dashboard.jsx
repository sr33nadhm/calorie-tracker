import CustomTab from 'components/Tab';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from 'semantic-ui-react';

function Dashboard({ user }) {
    const navigate = useNavigate();
    useEffect(() => { if (!user.email) { navigate("/") } }, [user, navigate])

    return (
        <Container textAlign='center'>
            <div className='dashboard-container'>
                <CustomTab user={user} />
            </div>
        </Container>
    )
}

export default Dashboard