import React from 'react';
import { Link } from "react-router-dom";
import {
  
  Card,
  CardActions,
  CardMedia,
  CardContent,
  List,
  ListItem,
  Typography,
  CardHeader,
  TextField,
  Box,
  Button,
} from '@material-ui/core';
import IconButton from '@mui/material/IconButton';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import BookmarkOutlinedIcon from '@mui/icons-material/BookmarkOutlined';
import './userPhotos.css';
import axios from 'axios';


/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comment: "",
    };
  }

  componentDidMount() {
    this.props.setUser(this.props.match.params.userId, true);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.userId !== this.props.match.params.userId) {
      this.props.setUser(this.props.match.params.userId, true);
    }
  }

  componentWillUnmount() {
    this.props.setUser("", false);
  }

  handleClick = () => {
    this.props.setUser(this.props.match.params.userId, true);
  };

  handleSubmit = (event) => {
    event.preventDefault();
    axios.post(`/commentsOfPhoto/${event.target.id}`, 
        {comment: this.state.comment}).then(() => {
        this.props.setUser(this.props.match.params.userId, true);
    }).catch(errMessage => {
        console.log(errMessage);
    });
  };

  handleLike = (photoId) => {
    axios.post(`/likesOfPhoto/${photoId}`,
      {}).then(() => {
        this.props.setUser(this.props.match.params.userId, true);
    }).catch(errMessage => {
      console.log(errMessage);
    });
  };

  handleFavorite = (photo) => {
    axios.post(`/favoritePhoto/${photo._id}`,
      {
        file_name: photo.file_name,
        date_time: photo.date_time,
        remove: false
      }).then((response) => {
        this.props.setLoggedIn(true, response.data.first_name, response.data._id, response.data);
      }).catch(errMessage => {
        console.log(errMessage);
      });
  };

  handleDeletePhoto = (photo) => {
    axios.post(`/deletePhoto/${photo._id}`, 
    {}).then((response) => {
      this.props.setLoggedIn(true, response.data.first_name, response.data._id, response.data);
      this.props.setUser(response.data._id, true);
    }).catch(errMessage => {
      console.log(errMessage);
    });
  };

  handleDeleteComment = (photo, comment) => {
    axios.post(`/deleteComment/${photo._id}`, 
    {comment_id : comment._id}).then((response) => {
      this.props.setLoggedIn(true, response.data.first_name, response.data._id, response.data);
      this.props.setUser(this.props.userObj._id, true);
    }).catch(errMessage => {
      console.log(errMessage);
    });
  }

  render() {
    if (!this.props.userPhotosIsFetched) return null;
    let options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}; 
    return (
      <div>
        <List>
          {this.props.userPhotos.map((photo) => (
            <div key={photo._id}>
              <ListItem className='overflow'>
                <Card className='overflow'>
                  <CardHeader title={(new Date(photo.date_time)).toLocaleDateString("en-US", options)} ></CardHeader>
                  <CardMedia
                    component="img"
                    image={`images/${photo.file_name}`}
                  />
                  <CardActions>
                    <IconButton aria-label="add to likes" onClick={() => this.handleLike(photo._id)}>
                      {
                        (() => {
                          for (let i = 0; i < photo.likes.length; i++) {
                            if (photo.likes[i].user_id === this.props.loggedInId) {
                              return true;
                            }
                          }
                          return false;
                        })() ? 
                        <FavoriteOutlinedIcon />
                        :
                        <FavoriteBorderOutlinedIcon />
                      }
                    </IconButton>
                    {photo.likes.length} likes
                    {(() => {
                          for (let i = 0; i < photo.likes.length; i++) {
                            if (photo.likes[i].user_id === this.props.loggedInId) {
                              return true;
                            }
                          }
                          return false;
                        })() ? <div>Photo Liked</div> : <></>}
                    <IconButton aria-label="add to favorites" onClick={() => this.handleFavorite(photo)}>
                      {
                        (() => {
                          for (let i = 0; i < this.props.loggedInUserObj.favoritePhotos.length; i++) {
                            if (photo._id === this.props.loggedInUserObj.favoritePhotos[i].photo_id) {
                              return true;
                            }
                          }
                          return false;
                        })() ? 
                        <BookmarkOutlinedIcon />
                        :
                        <BookmarkBorderOutlinedIcon />
                      }
                    </IconButton>
                    Favorite
                    {
                      this.props.loggedInId === this.props.userObj._id?
                      <Typography onClick={() => this.handleDeletePhoto(photo)}> Delete Photo </Typography>
                      :
                      <></>
                    }
                  </CardActions>
                  <CardContent >
                    <List>
                      {photo.comments?.map((comment) => (
                        <ListItem key={comment.user.first_name + comment.date_time} >
                          <div>
                            <Link to={`/users/${comment.user._id}`} 
                                  style={{ textDecoration: 'none' }}
                                  onClick={this.handleClick}> 
                              {comment.user.first_name + " " + comment.user.last_name} 
                            </Link>
                            <div >
                              <Typography className='comment'>
                                {`${comment.comment} `} 
                              </Typography>
                              <div className='date'> {(new Date(comment.date_time)).toLocaleDateString("en-US", options)} </div>
                              {
                                this.props.loggedInId === comment.user._id?
                                <Typography onClick={() => this.handleDeleteComment(photo, comment)}> Delete Comment </Typography>
                                :
                                <></>
                              }
                            </div>
                          </div>
                        </ListItem>
                      ))}
                    </List>
                    <Box
                      component="form"
                      sx={{
                      '& > :not(style)': { m: 1, width: '25ch' },
                      }}
                      noValidate
                      autoComplete="off"
                      id={photo._id}
                      onSubmit={this.handleSubmit}
                    >
                      <TextField label="Add Comment" variant="standard" onChange={(e) => this.setState({comment : e.target.value})}/>
                      <Button type="submit"> Post </Button>
                    </Box>
                  </CardContent>
                </Card>
              </ListItem>
            </div>
          ))}
        </List>
      </div>
    );
  }
}

export default UserPhotos;
