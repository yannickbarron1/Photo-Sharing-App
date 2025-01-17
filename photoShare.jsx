import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch, Redirect
} from 'react-router-dom';
import {
  Grid, Paper
} from '@material-ui/core';
import './styles/main.css';

// import necessary components
import axios from 'axios';
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/userDetail';
import UserList from './components/userList/userList';
import UserPhotos from './components/userPhotos/userPhotos';
import LoginRegister from './components/loginRegister/loginRegister';
import Favorites from './components/favorites/favorites';

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      versionNum: NaN,
      versionNumIsFetched : false,
      userObj : undefined,
      userObjIsFetched : false,
      userList : undefined,
      userListIsFetched : false,
      displayPhotos : false,
      userPhotos : undefined,
      userPhotosIsFetched : false,
      loggedIn: false,
      loggedInFirstName: "",
      loggedInId: "",
      loggedInUserObj: undefined,
    };
  }

  componentDidMount() {
    //fetches test info
    
    axios.get("/test/info").then(response => {
      this.setState({
        versionNum : response.data.__v,
        versionNumIsFetched : true,
      });
    }).catch(errMessage => {
      console.log(errMessage);
    });
    //fetches model for the user list
    axios.get("user/list").then(response => {
      this.setState({
        userList : response.data,
        userListIsFetched : true,
      });
    }).catch(errMessage => {
      console.log(errMessage);
    });
  }

  setUserList = () => {
    axios.get("user/list").then(response => {
      this.setState({
        userList : response.data,
        userListIsFetched : true,
      });
    }).catch(errMessage => {
      console.log(errMessage);
    });
  }

  setLoggedIn = (loginBool, firstName, userId, userObj) => {
    this.setState({
      loggedIn: loginBool,
      loggedInFirstName: firstName,
      loggedInId: userId,
      loggedInUserObj: userObj,
    });
  };

  updateUser = (newUserId, photosOption) => {
    if (newUserId === "") {
      this.setState({
        userObj : undefined,
        userObjIsFetched : false,
      });
    } else {
      //fetches the new user and updates the state
      axios.get(`/user/${newUserId}`).then(response => {
        this.setState({
          userObj : response.data,
          userObjIsFetched : true,
        });
      }).catch(errMessage => {
        console.log(errMessage);
      });
    }
    this.setState({displayPhotos : photosOption});
    //fetches photo model for a user
    //sets state properties relating to photos
    if (photosOption) {
      axios.get(`/photosOfUser/${newUserId}`).then(response => {
        this.setState({
          userPhotos : response.data,
          userPhotosIsFetched : true,
        });
      }).catch(errMessage => {
        console.log(errMessage);
      });
    } else {
      this.setState({
        userPhotos : undefined,
        userPhotosIsFetched : false,
      });
    }
  };

  render() {
    return (
      <HashRouter>
      <div>
      <Grid container spacing={8} >
        <Grid item xs={12}>
          <TopBar userObj={this.state.userObj} 
          displayPhotos={this.state.displayPhotos}
          versionNum={this.state.versionNum}
          versionNumIsFetched={this.state.versionNumIsFetched}
          loggedIn={this.state.loggedIn}
          loggedInFirstName={this.state.loggedInFirstName}
          setLoggedIn={this.setLoggedIn}
          setUser={this.updateUser}
          setUserList={this.setUserList}/>
        </Grid>
        <div className="cs142-main-topbar-buffer"/>
        <Grid item sm={3}>
          <Paper className="cs142-main-grid-item">
            <UserList 
            loggedIn={this.state.loggedIn}
            userList={this.state.userList} 
            userListIsFetched={this.state.userListIsFetched}
            setUser={this.updateUser}/>
          </Paper>
        </Grid>
        <Grid item sm={9} >
          <Paper className="cs142-main-grid-item" >
            <Switch >
              {
                this.state.loggedIn ?
                (
                <Route path="/users/:userId"
                  render={
                    props => (
                      <UserDetail {...props} 
                      userObj={this.state.userObj} 
                      userObjIsFetched={this.state.userObjIsFetched} 
                      setUser={this.updateUser}/>
                    )
                  }
                />
                )
                :
                (<Redirect path="/users/:id" to="/login-register" />)
              }
              {
                this.state.loggedIn ?
                (
                <Route path="/photos/:userId"
                render ={ 
                  props => (
                    <UserPhotos {...props}
                    loggedInId={this.state.loggedInId}
                    loggedInUserObj={this.state.loggedInUserObj}
                    setLoggedIn={this.setLoggedIn}
                    userObj={this.state.userObj} 
                    userPhotos={this.state.userPhotos}
                    userPhotosIsFetched={this.state.userPhotosIsFetched}
                    setUser={this.updateUser}/>
                  )
                }
                />
                )
                :
                (<Redirect path="/photos/:id" to="/login-register" />)
              }
              {
                this.state.loggedIn ?
                (
                <Route path="/users" 
                  render={ 
                    props => (
                      <UserList {...props}
                      loggedIn={this.state.loggedIn}
                      userList={this.state.userList} 
                      userListIsFetched={this.state.userListIsFetched}
                      setUser={this.updateUser}/> 
                    )
                  }
                />
                )
                :
                <Redirect path="/users" to="/login-register" />
              }

              {
                this.state.loggedIn ?
                  (
                  <Route>
                    <Favorites 
                      loggedInUserObj={this.state.loggedInUserObj}
                      setLoggedIn={this.setLoggedIn}
                    />
                  </Route>
                  )
                :
                <Redirect path="/favorites" to="/login-register" />
              }

              {
                this.state.loggedIn ?
                (<Redirect path="login-register" to={`/users/${this.state.loggedInId}`} />)
                :
                (
                <Route path="/login-register">
                  <LoginRegister setUser={this.updateUser} setLoggedIn={this.setLoggedIn}/>
                </Route>
                )
              }
              {
                this.state.loggedIn ?
                <Redirect path="" to={`/users/${this.state.loggedInId}`} />
                :
                (
                <Route path="">
                  <LoginRegister setUser={this.updateUser} setLoggedIn={this.setLoggedIn}/>
                </Route>
                )
              }
            </Switch>
          </Paper>
        </Grid>
      </Grid>
      </div>
      </HashRouter>
    );
  }
}


ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);
