import React from 'react';
import { Link } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Button, Box, Modal,
} from '@material-ui/core';
import './TopBar.css';
import axios from 'axios';

/**
 * Define TopBar, a React componment of CS142 project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "Yannick Barron",
      modalIsOpen : false,
    };
  }

  handleClick = () => {
    axios.post("/admin/logout", 
      {}).then(() => {
        this.props.setLoggedIn(false, "", "", undefined);
    }).catch(errMessage => {
        console.log(errMessage);
    });
  };

  handleDeleteAccount = () => {
    this.setState({modalIsOpen: false});
    axios.post("/deleteAccount",
    {}).then(() => {
      this.props.setLoggedIn(false, "", "", undefined);
      this.props.setUser("", false);
      this.props.setUserList();
    }).catch(errMessage => {
      console.log(errMessage);
    });
  };

  handleOpen = () => {
    this.setState({
        modalIsOpen : true,
    })
  }

  handleClose = () => {
    this.setState({
        modalIsOpen: false,
    })
  }

  render() {
    if (!this.props.versionNumIsFetched) return null;
    let displayStr = (() => {
      let name = (this.props.userObj === undefined? "" : 
        `${this.props.userObj.first_name} ${this.props.userObj.last_name}`);
      let display = this.props.displayPhotos? `${name}'s Photos` : name;
      return display;
    })();

    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar className='rand'>
          <div className='toolbar'>
            <div className="item1">
              <Typography variant="h5" color="inherit">
                {this.state.name}
              </Typography>
            </div>
            <div className="item2">
              <Typography>
                Version No. {this.props.versionNum}
              </Typography>
              {
                this.props.loggedIn ? 
                  (
                  <div>
                    <Typography>Hi {this.props.loggedInFirstName}</Typography>
                    <Link to={"/favorites"} style={{ textDecoration: 'none' }}>
                      <Typography>
                        Show Favorite Photos
                      </Typography>
                    </Link>
                  </div>
                  )
                :
                  <Typography></Typography>
              }
            </div>
            <div className="item3">
              <Typography>
                {displayStr}
              </Typography>
              {
              this.props.loggedIn ? 
                (
                <div>
                <Link to={"/login-register"} style={{ textDecoration: 'none' }}>
                  <Typography onClick={this.handleClick}>
                      Logout
                  </Typography>
                </Link>
                <Typography onClick={this.handleOpen}>
                  Delete Account
                </Typography>
                </div>
                )
                : 
                (<Typography></Typography>)
              }
              <Modal
                open={this.state.modalIsOpen}
                onClose={this.handleClose}
              >
                <Box >
                  <Link to={"/login-register"} style={{ textDecoration: 'none' }}>
                    <Button onClick={this.handleDeleteAccount}> Delete Account </Button>
                  </Link>
                </Box>
              </Modal>
            </div>
          </div>
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
