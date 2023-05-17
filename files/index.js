import { WfuUserInfo, WfuUser, isLoggedIn } from 'https://cdn.jsdelivr.net/gh/sygnaltech/webflow-util@4.7/src/modules/webflow-membership.min.js'; 
import { WfuDataBinder } from 'https://cdn.jsdelivr.net/gh/sygnaltech/webflow-util@4.7/src/modules/webflow-databind.min.js'; 

let user;
let api_data;
const scriptTag = document.querySelector('script[spark]');
const spark = scriptTag.getAttribute('spark');
const environment = scriptTag.getAttribute('environment');
const code = scriptTag.getAttribute('code')

let submit_comment_url;
let get_comments_url;
let delete_comments_url;

function getParentComment(commentId) {
  const comments = api_data['comments']
  console.log('Comments:', api_data['comments'])
  // find the comment with the given ID
  const comment = comments.find(c => c.comment_id === commentId);
  if (!comment) {
    // if the comment is not found, return null
    return '';
  }
  // if the comment has no reply_to property, it is the parent comment
  if (!comment.reply_to) {
    return comment.comment_id;
  }
  // recursively call this function with the parent comment ID
  return getParentComment(comment.reply_to);
}


if (environment === 'staging') {
  submit_comment_url = 'https://supersparksio.bubbleapps.io/version-test/api/1.1/wf/comment-guest-post'
  get_comments_url = 'https://supersparksio.bubbleapps.io/version-test/api/1.1/wf/comment-get'
  delete_comments_url = 'https://supersparksio.bubbleapps.io/version-test/api/1.1/wf/delete-comment'
} else if (environment === 'production') {
  submit_comment_url = 'https://app.supersparks.io/api/1.1/wf/comment-post'
  get_comments_url = 'https://app.supersparks.io/api/1.1/wf/comment-get'
  delete_comments_url = 'https://app.supersparks.io/api/1.1/wf/delete-comment'
}

function getMemberSubmitCommentUrl() {
  if (environment === 'staging') {
    return 'https://supersparksio.bubbleapps.io/version-test/api/1.1/wf/comment-member-post'
  } else if (environment === 'production') {
    // Provide a submit url for production and replace the below
    return 'https://supersparksio.bubbleapps.io/version-test/api/1.1/wf/comment-member-post'
  }
}

$(function() {  

  var membership = new WfuUserInfo({
    userInfoUpdatedCallback: myCallback
  }).init(); 
  
});  

async function myCallback(user) {

  var dataBinder = new WfuDataBinder({
  	user: user
  }).bind();
  
  // Call page user data callback, if existing 
  if (window.userInfoUpdatedPageCallback)
  	window.userInfoUpdatedPageCallback(user);
    console.log('logged In')
    main(user)
} 

if (!isLoggedIn()) {
  console.log('Not logged In')
  main()
}

function main(user) {

  let domain = window.location.hostname
  const isLocalhost = domain === '127.0.0.1' || domain === 'localhost';

  if (isLocalhost) {
    console.log('This page is running on localhost');
    domain = 'supersparkss-comment-test-2.webflow.io'
    var collection = 'test';
    var slug = 'edilson-test';
    var user = {'email': 'edilsongudo@gmail.com', 'name': 'Edilson'};
  } else {
    console.log('This page is running on a remote server');
    const url = window.location.href;
    const segments = url.split('/');
    const collectionIndex = segments.indexOf(window.location.hostname) + 1;    
    var collection = segments[collectionIndex];    
    const slugIndex = segments.length - 1;    
    var slug = segments[slugIndex];
    console.log(collection, slug)
  }
  
  function timeAgo(timestamp) {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    const intervals = [
      { label: 'year',   seconds: 31536000 },
      { label: 'month',  seconds: 2592000 },
      { label: 'week',   seconds: 604800 },
      { label: 'day',    seconds: 86400 },
      { label: 'hour',   seconds: 3600 },
      { label: 'minute', seconds: 60 },
      { label: 'second', seconds: 1 }
    ];
    for (let i = 0; i < intervals.length; i++) {
      const interval = intervals[i];
      const intervalCount = Math.floor(seconds / interval.seconds);
      if (intervalCount >= 1) {
        const label = intervalCount === 1 ? interval.label : interval.label + 's';
        return intervalCount + ' ' + label + ' ago';
      }
    }
    return 'just now';
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear().toString()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    return formattedDate;
  }

  function formatDate2(dateString) {
    const date = new Date(dateString);
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    return formattedDate;
  }

  function getFormatedTime(dateString, format) {
    if (format === "How long ago" || format === "") {
      return timeAgo(dateString)
    }
    if (format === "mm/dd/yyyy hh:mm") {
      return formatDate(dateString)
    }
    if (format === "dd/mm/yyyy hh:mm") {
      return formatDate2(dateString)
    }
  }
      
  async function hashString(str) {
    const data = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  function base64Encode(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    return btoa(String.fromCharCode(...new Uint8Array(data)));
  }

  function base64Decode(input) {
    const decodedData = atob(input);
    const decoder = new TextDecoder();
    const decodedString = decoder.decode(new Uint8Array(
      [...decodedData].map((char) => char.charCodeAt(0)),
    ));
    return decodedString;
  }

  async function get_post_data(obj) {
    const post_data = {
      slug,
      name: user ? user.name : obj.name,
      email: user ? user.email : obj.email,
      id: user ? await hashString(user.email) : '',
      comment: base64Encode(obj.comment),
      spark,
      replyTo: obj.comment_id ? obj.comment_id : '',
      replyComment: getParentComment(obj.comment_id),
      authorType: user ? 'Member' : 'Guest',
      commentType: obj.comment_id ? 'reply' : 'comment',
      environment,
      domain
    };
    return post_data
  }

  function send_post_request(url, post_data, callback) {
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(post_data)
    })
    .then(response => response.json())
    .then(data => {
      console.log(data)
      callback(data)
    })
    .catch(error => console.error(error))
  }

  function commentDeletetionCallback(data) {
    console.log(data)
  }
  
  function incrementComments(myDiv) {
    const content = myDiv.innerHTML;
    const regex = /\d+/;
    const number = parseInt(content.match(regex)[0]);
    const incrementedNumber = number + 1;
    myDiv.innerHTML = content.replace(regex, incrementedNumber.toString());
  }
  
  const comment_card = document.querySelector(`.supersparks-comment-card-${code}`);
  const reply_card = document.querySelector(`.supersparks-reply-card-${code}`);
  let comment_card_clone;
  let reply_card_clone;

  if (comment_card) {
    comment_card_clone = comment_card.cloneNode(true)
    comment_card.remove()
  }
  if (reply_card) {
    reply_card_clone = reply_card ? reply_card.cloneNode(true) : null
    reply_card.remove()
  }
  
  fetch(`${get_comments_url}?spark=${spark}&slug=${slug}&collection=${collection}&domain=${domain}`)
    .then(response => response.json())
    .then(data => {
    api_data = data;
    const comment_input = document.querySelector(`.${data['classes'][0]['comment_input']}`);
    const comments_grid = document.querySelector(`.${data['classes'][0]['comments_grid']}`);
    const comment_content = document.querySelector(`.${data['classes'][0]['comment_content']}`);
    const author_name = document.querySelector(`.${data['classes'][0]['author_name']}`);
    const name_input = document.querySelector(`.${data['classes'][0]['name_input']}`);
    const email_input = document.querySelector(`.${data['classes'][0]['email_input']}`);
    const comment_time = document.querySelector(`.${data['classes'][0]['comment_time']}`);
    const profile_image = document.querySelector(`.${data['classes'][0]['profile_image']}`);
    const username = document.querySelector(`.${data['classes'][0]['username']}`);
    const comment_count = document.querySelector(`.${data['classes'][0]['comment_count']}`);
    const comment_submit = document.querySelector(`.${data['classes'][0]['comment_submit']}`)
    let comments = data['comments']
    const settings = data["settings"][0]

    function reverseOrder(arr) {
      if (settings["comment_order"] === "Newest First" || settings["comment_order"] === ""){
        arr.reverse()
      }
    }

    reverseOrder(comments)
        
    // Place the reply inside an array
    comments = data.comments.reduce((acc, curr) => {
      curr.replies = [];
      acc[curr.comment_id] = curr;
      return acc;
    }, {});
    
    for (const comment of data.comments) {
      if (comment.reply_to !== "") {
        comments[comment.reply_to].replies.push(comment);
      }
    }
    
    const buildCommentThread = (comment) => {
      const thread = [comment];
      if (comment.replies && comment.replies.length > 0) {
        for (const reply of comment.replies) {
          thread.push(...buildCommentThread(reply));
        }
      }
      return thread;
    };
    
    comments = Object.values(comments)
      .filter((comment) => comment.reply_to === "")
      .map((comment) => {
        comment.replies = buildCommentThread(comment)
          .filter((reply) => reply.comment_id !== comment.comment_id);
        return comment;
      });
    
    // End

    async function addCommentCardInfo(elem, data) {
      elem.setAttribute("data-comment", data['comment_id']);
      elem.setAttribute("data-comment_type", data['comment_type']);
      elem.querySelector(`.${api_data['classes'][0]['comment_content']}`).innerText = data['coment_content'] ? base64Decode(data['coment_content']) : base64Decode(data['comment_content'])
      const elem_delete_button = elem.querySelector(`.${api_data['classes'][0]['delete_button']}`)
      if (elem_delete_button) {
        elem_delete_button.setAttribute("user_id", data['user_id']);
        if (data['user_id'] !== await hashString(user.email)) {
          elem_delete_button.style.display = 'none'
        }
      }
      const elem_author_name = elem.querySelector(`.${api_data['classes'][0]['author_name']}`)
      if (elem_author_name) {
        elem_author_name.innerText = data['author_name']
      }
      const elem_username = elem.querySelector(`.${api_data['classes'][0]['username']}`)
      if (elem_username) {
        elem_username.innerText = data['username']
      }
      const elem_comment_time = elem.querySelector(`.${api_data['classes'][0]['comment_time']}`)
      if (elem_comment_time) {
        elem_comment_time.innerText = getFormatedTime(data['comment_time'], settings['date_format'])
      }
      const profile_image = elem.querySelector(`.${api_data['classes'][0]['profile_image']}`)
      if (profile_image) {
        if (data['profile_image']) {
          profile_image.src = data['profile_image']
          profile_image.removeAttribute('srcset')
        }
      }
      // console.log(elem)
    }

    function insertReplyInDom(data) {
      api_data['comments'].push(data)
      const commentElement = document.querySelector(`[data-comment=${data['reply_to']}]`)
      if (reply_card_clone) {
        const replyElement = reply_card_clone.cloneNode(true);
        addCommentCardInfo(replyElement, data)
        commentElement.insertAdjacentElement('afterend', replyElement)
        incrementComments(comment_count)
        Webflow.require('ix2').init()
        replyElement.querySelector('[type="submit"]').addEventListener('click', (e)=> {e.preventDefault();handleReply(replyElement, data)}) 
      }     
    }

    async function handleReply(elem, comment) {
      const comment_input = elem.querySelector(`.${data['classes'][0]['comment_input']}`)
      const name_input = elem.querySelector(`.${data['classes'][0]['name_input']}`)
      const email_input = elem.querySelector(`.${data['classes'][0]['email_input']}`)

      const comment_value = comment_input.value.trim()
      const name = name_input ? name_input.value.trim() : ''
      const email = email_input ? email_input.value.trim() : ''
      const obj =  {
        "comment": comment_value,
        "name": name,
        "email": email,
        "comment_id": comment['comment_id']
      } 
      const post_data = await get_post_data(obj)
      if (user) {
        submit_comment_url = getMemberSubmitCommentUrl()
      }
      const url = submit_comment_url
      send_post_request(url, post_data, insertReplyInDom)
    }
    
    comments.forEach((comment)=> {
      const commentElement = comment_card_clone.cloneNode(true);
      addCommentCardInfo(commentElement, comment)
      comments_grid.appendChild(commentElement)

      commentElement.querySelector('[type="submit"]').addEventListener('click', (e)=> {e.preventDefault();handleReply(commentElement, comment)})
  
      const replies = comment.replies

      reverseOrder(comment.replies)

      replies.forEach((reply)=> {
        if (reply_card_clone) {
          const replyElement = reply_card_clone.cloneNode(true);
          addCommentCardInfo(replyElement, reply)
          commentElement.insertAdjacentElement('afterend', replyElement)
  
          replyElement.querySelector('[type="submit"]').addEventListener('click', (e)=> {e.preventDefault();handleReply(replyElement, reply)})
        }
      })
    })
  
    Webflow.require('ix2').init()
  
    console.log(user)
    if (user) {
      submit_comment_url = getMemberSubmitCommentUrl()
    }

    function insertCommentsInDom(data) {
      api_data['comments'].push(data)
      comment_input.value = '';
      const copy = comment_card_clone.cloneNode(true);
      addCommentCardInfo(copy, data)
      comments_grid.insertBefore(copy, comments_grid.firstChild)
      incrementComments(comment_count)
      Webflow.require('ix2').init()
      copy.querySelector('[type="submit"]').addEventListener('click', (e)=> {e.preventDefault();handleReply(copy, data)})
    }
  
    async function submitComment() {
      const comment = comment_input.value.trim()
      const name = name_input ? name_input.value.trim() : ''
      const email = email_input ? email_input.value.trim() : ''
      if (comment == "") {
        return false
      }
      const obj =  {
        "comment": comment,
        "name": name,
        "email": email
      } 
      const post_data = await get_post_data(obj)
      const url = submit_comment_url
      send_post_request(url, post_data, insertCommentsInDom)
    }
    
    if (comment_count) {
      comment_count.innerText = `${data['total-comments']}`
    }
    
    comment_submit.addEventListener('click', (e)=> {
        e.preventDefault();
        submitComment()
    })
  
    const delete_button = document.querySelectorAll(`.${data['classes'][0]['delete_button']}`);
    if (delete_button) {
      delete_button.forEach((button)=> {   
        button.addEventListener('click', async (e)=> {
          const comment_id = button.closest('[data-comment]').getAttribute('data-comment')
          const post_data = {'comment-id': comment_id, 'spark': spark,'user-id': await hashString(user['email'])}
          const url = delete_comments_url
          send_post_request(url, post_data, commentDeletetionCallback)
        }) 
      })
    }

  })
    .catch(error => console.error(error));
  
}