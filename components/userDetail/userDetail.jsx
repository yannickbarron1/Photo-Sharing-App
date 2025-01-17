import React from 'react';
import { Link } from "react-router-dom";
import {
  Typography
} from '@material-ui/core';
import './userDetail.css';


/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.setUser(this.props.match.params.userId, false);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.userId !== this.props.match.params.userId) {
      this.props.setUser(this.props.match.params.userId, false);
    }
  }

  componentWillUnmount() {
    this.props.setUser("", false);
  }
  
  handleClick = () => {
    this.props.setUser(this.props.match.params.userId, true);
  };

  render() {
    if (!this.props.userObjIsFetched) return null;
    return (
      <div className='user-detail-container'>
        <Typography className='name'>Name: {this.props.userObj.first_name} {this.props.userObj.last_name}</Typography>
        <Typography className='location'>Location: {this.props.userObj.location}</Typography>
        <Typography className='description'>Description: {this.props.userObj.description}</Typography>
        <Typography className='occupation'>Occupation: {this.props.userObj.occupation}</Typography>
        <Link to={"/photos/"+this.props.userObj._id} onClick={this.handleClick}>{this.props.userObj.first_name} {this.props.userObj.last_name}&apos;s Photos</Link>
      </div>
    );
  }
}

export default UserDetail;