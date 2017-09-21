import React, { Component } from 'react'
import { GC_USER_ID } from '../constants'
import { timeDifferenceForDate } from '../utils'
import { gql, graphql, compose } from 'react-apollo'

class Link extends Component {

  render() {
    const userId = localStorage.getItem(GC_USER_ID)
    return (
      <div className='flex mt2 items-start'>
        <div className='flex items-center'>
          <span className='gray'>{this.props.index + 1}.</span>
          {userId && <div className='ml1 gray f11' onClick={() => this._voteForLink()}>▲</div>}
        </div>
        <div className='ml1'>
          <div>{this.props.link.description} ({this.props.link.url})</div>
          <div className='f6 lh-copy gray'>{this.props.link.votes.length} votes | by {this.props.link.postedBy ? this.props.link.postedBy.name : 'Unknown'} {timeDifferenceForDate(this.props.link.createdAt)}</div>
        </div>
        <div className='fr'>
        {userId && <div className='ml1 gray f11 b' style={{color:'blue'}} onClick={() => this._editLink()}>edit</div>}
        {userId && <div className='ml1 gray f11 b' style={{color:'red'}} onClick={() => this._deleteLink()}>delete</div>}
        </div>
      </div>
    )
  }

  _voteForLink = async () => {
    const userId = localStorage.getItem(GC_USER_ID)
    const voterIds = this.props.link.votes.map(vote => vote.user.id)
    if (voterIds.includes(userId)) {
      console.log(`User (${userId}) already voted for this link.`)
      return
    }

    const linkId = this.props.link.id
    await this.props.createVoteMutation({
      variables: {
        userId,
        linkId
      },
      update: (store, { data: { createVote } }) => {
        this.props.updateStoreAfterVote(store, createVote, linkId)
      }
    })
  }
  _deleteLink = async() =>{
    const linkId = this.props.link.id
    await this.props.deleteLinkMutation({
      variables: {
        linkId
      },
      update: (store, { data: { createVote } }) => {
        this.props.updateStoreAfterVote(store, createVote, linkId)
      }
    })
  }

  _editLink = async() =>{
    return;
  }

}

const CREATE_VOTE_MUTATION = gql`
mutation CreateVoteMutation($userId: ID!, $linkId: ID!) {
  createVote(userId: $userId, linkId: $linkId) {
    id
    link {
      votes {
        id
        user {
          id
        }
      }
    }
    user {
      id
    }
  }
}
`
const DELETE_LINK_MUTATION = gql`
mutation deleteLinkMutation($linkId:ID!) {
  deleteLink(id:$linkId){
    id
  }
}
`

export default compose(
  graphql(CREATE_VOTE_MUTATION, {name: 'createVoteMutation'}),
  graphql(DELETE_LINK_MUTATION, {name: 'deleteLinkMutation'})
)(Link)