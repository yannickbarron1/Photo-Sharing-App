import React from 'react';
import { withRouter } from "react-router-dom";
import {
  Box, TextField, Button
} from '@material-ui/core';
import './loginRegister.css';
import axios from 'axios';


/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        login_name: "",
    };
  }

  handleSubmit = (event) => {
    event.preventDefault();
    axios.post("/admin/login", 
        {login_name: this.state.login_name}).then(response => {
        this.props.setLoggedIn(true, response.data.first_name, response.data._id, response.data);
        this.props.setUser(response.data._id, false)
        this.props.history.push({pathname : `/users/${response.data._id}`});
    }).catch(errMessage => {
        console.log(errMessage);
    });
  };



  render() {
    
    return (
        <Box
            component="form"
            sx={{
            '& > :not(style)': { m: 1, width: '25ch' },
            }}
            noValidate
            autoComplete="off"
            onSubmit={this.handleSubmit}
        >
            <TextField id="login-name" label="Login Name" variant="standard" onChange={(e) => this.setState({login_name : e.target.value})}/>
            <Button type="submit"> Login </Button>
            
        </Box>
    );
  }
}

export default withRouter(LoginRegister);