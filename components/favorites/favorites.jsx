import React from 'react';
import { withRouter } from "react-router-dom";
import {
  Box, 
  TextField, 
  Button,
  Typography,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Modal,
} from '@material-ui/core';
import './favorites.css';
import axios from 'axios';
import IconButton from '@mui/material/IconButton';
import BookmarkRemoveOutlinedIcon from '@mui/icons-material/BookmarkRemoveOutlined';


/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class Favorites extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        modalIsOpen : false,
        modalFileName : "",
        modalDateTime : "",
    }
  }

  handleFavorite = (photo) => {
    axios.post(`/favoritePhoto/${photo.photo_id}`,
      {
        file_name: photo.file_name,
        date_time: photo.date_time,
        remove: true
      }).then((response) => {
        this.props.setLoggedIn(true, response.data.first_name, response.data._id, response.data);
      }).catch(errMessage => {
        console.log(errMessage);
      });
  };

  handleOpen = (fileName, dateTime) => {
      this.setState({
          modalIsOpen : true,
          modalFileName : fileName,
          modalDateTime : dateTime,
      })
  }

  handleClose = () => {
      this.setState({
          modalIsOpen: false,
          modalFileName : "",
          modalDateTime : "",
      })
  }

  render() { 
    let options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
    return (
        <div>
            <ImageList sx={{ width: 500, height: 450 }}>
                {this.props.loggedInUserObj.favoritePhotos.map((photo) => (
                    <ImageListItem key={photo.photo_id}>
                        <img
                            src={`images/${photo.file_name}`}
                            alt={photo.file_name}
                            loading="lazy"
                            onClick={() => this.handleOpen(photo.file_name, photo.date_time)}
                        />
                        <ImageListItemBar
                            title={(new Date(photo.date_time)).toLocaleDateString("en-US", options)}
                            position="bottom"
                            actionIcon={
                                <IconButton
                                    sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                                    aria-label={`info about ${photo.file_name}`}
                                    onClick={() => this.handleFavorite(photo)}
                                >
                                    <BookmarkRemoveOutlinedIcon />
                                </IconButton>
                            }
                        />
                    </ImageListItem>
                ))}
            </ImageList>
            <Modal 
                open={this.state.modalIsOpen}
                onClose={this.handleClose}>
                <figure>
                    <img
                        src={`images/${this.state.modalFileName}`}
                        alt={this.state.modalFileName}
                        loading="lazy"
                    />
                    <figcaption className='modal-caption'>{(new Date(this.state.modalDateTime)).toLocaleDateString("en-US", options)}</figcaption>
                </figure>
            </Modal>
        </div>
    );
  }
}

export default Favorites;