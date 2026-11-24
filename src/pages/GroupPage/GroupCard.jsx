import { Link } from 'react-router-dom'
import Icon from '../../components/Icon/Icon'

// group sisältää sivulta propsina saadun yksittäisen ryhmän tiedot
function GroupCard({ group }) {
    return (
        <Link to={`/groups/${group.groupid}`} className="group-card">
            {/* yhteinen icon ja CSS muotoilu */}
            <div className="group-card-cover" aria-hidden="true">
                <Icon name="film" size={72} />
            </div>

            <div className="group-card-body">
                <span className="group-avatar" aria-hidden="true">
                    {group.groupname.slice(0, 1).toUpperCase()}
                </span>

                <h2>{group.groupname}</h2>

                {/* varateksti jos kuvausta ei ole */}
                <p className="group-card-description">
                    {group.groupdescription || 'Ryhmällä ei ole kuvausta.'}
                </p>

                <div className="group-card-meta">
                    <span>
                        {group.membercount}{' '}
                        {group.membercount === 1 ? 'jäsen' : 'jäsentä'}
                    </span>

                    {/* inviteonly: true = suljettu, false = avoin */}
                    <span>
                        {group.inviteonly ? 'Suljettu' : 'Avoin'}
                    </span>
                </div>
            </div>
        </Link>
    )
}

export default GroupCard