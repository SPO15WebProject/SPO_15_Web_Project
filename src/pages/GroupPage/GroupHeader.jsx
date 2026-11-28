import Icon from '../../components/Icon/Icon'
import LeaveGroupButton from './LeaveGroupButton'

// group ja isMember saadaan sivulta propseina
function GroupHeader({ group, isMember, userId }) {
    const memberCount = group.members.length

    return (
        <>
            {/* käytetään samaa tyyliä ja kuvaketta kuin ryhmäkorteissa */}
            <div className="group-card-cover group-cover" aria-hidden="true">
                <Icon name="film" size={96} />
            </div>

            <header className="group-details-header">
                <div className="group-identity">
                    {/* ryhmän ensimmäinen kirjain toimii tunnuksena */}
                    <span
                        className="group-avatar group-avatar-large"
                        aria-hidden="true"
                    >
                        {group.groupname.slice(0, 1).toUpperCase()}
                    </span>

                    <div>
                        <h1>{group.groupname}</h1>

                        {/* jäsenmäärä ja ryhmän tyyppi */}
                        <p>
                            {memberCount}{' '}
                            {memberCount === 1 ? 'jäsen' : 'jäsentä'}
                            {' · '}
                            {group.inviteonly ? 'Suljettu ryhmä' : 'Avoin ryhmä'}
                        </p>
                    </div>
                </div>

                {/* nämä merkinnät näytetään vain jos käyttäjä kuuluu ryhmään */}
                {isMember && (
                    <div className="group-member-actions">
                        <span className="group-membership">Olet jäsen</span>
                        <LeaveGroupButton group={group} userId={userId} />
                    </div>
                )}
            </header>
        </>
    )
}

export default GroupHeader