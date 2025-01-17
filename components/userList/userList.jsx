import React from 'react';
import { Link } from "react-router-dom";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
}
from '@material-ui/core';
import './userList.css';

/**
 * Define UserList, a React componment of CS142 project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
  }

  handleClick = (e) => {
    this.props.setUser(e.currentTarget.id, false);
  };

  render() {
    if (!this.props.loggedIn) return null;
    if (!this.props.userListIsFetched) return null;
    return (
      <div>
        <List component="nav">
          {this.props.userList.map(user => (
              <Link to={"/users/"+user._id} style={{ textDecoration: 'none' }} key = {user._id}>
                <ListItem
                  button
                  id={user._id}
                  onClick={this.handleClick}>
                  <ListItemText primary={user.first_name + " " + user.last_name} secondary={user.location}/>
                </ListItem>
                <Divider />
              </Link>
            )
          )}
        </List>
      </div>
    );
  }
}

export default UserList;
