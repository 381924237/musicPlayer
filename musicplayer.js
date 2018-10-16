function $(selector) {
  return document.querySelector(selector)
}

function $$(selector) {
  return document.querySelectorAll(selector)
}

//ajax请求，函数封装
function getMusicList(callback) {
  var xhr = new XMLHttpRequest()
  xhr.open('GET','/musicPlayer/music.json',true)
  xhr.onload = function(){
    if((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304){
      callback(JSON.parse(this.responseText))
    }else{
      console.log('获取数据失败')
    }  
  }
  xhr.onerror = function() {
    console.log('网络异常')
  }
  xhr.send()
}

var musicList = []
var currentIndex = 0
var audio = new Audio()
audio.autoPlay = true

//执行ajax封装函数,得到音乐信息
getMusicList(function(list) {
  musicList = list
  loadMusic(list[currentIndex])
  generateList(list)
})

//生成音乐列表
function generateList(musicObj) {
  var list = document.createDocumentFragment()  
  musicObj.forEach(function(ele,index){
    var title = ele.title
    var singer = ele.singer
    var li = document.createElement('li')
    li.classList.add(index)
    li.innerText = title + ' ' + '-' + ' ' + singer
    list.appendChild(li)
  })
  $('ul').appendChild(list)
}

//音乐列表绑定事件
$('ul').onclick = function(eve) {
  currentIndex = eve.target.classList.value
  loadMusic(musicList[currentIndex])
}

//播放音乐
function loadMusic(musicObj) {
  audio.src = musicObj.src
  $('.title').innerText = musicObj.title
  $('.singer').innerText = musicObj.singer
}

//播放音乐时，进度条和时间变化
audio.ontimeupdate = function() {
    $('.progress-now').style.width = (audio.currentTime/audio.duration)*100 + '%'

}

audio.addEventListener('play',function(){
  clock = setInterval(function(){
    var min = Math.floor(audio.currentTime/60) + ''
    min = (min.length === 2) ? min : ('0' + min) 
    var sec = Math.floor(audio.currentTime)%60 + ''
    sec = (sec.length === 2) ? sec : ('0' + sec)
    $('.time').innerText = min + ':' + sec         
  },1000)

  $('.play').classList.remove('icon-play')
  $('.play').classList.add('icon-stop')
})

audio.onpause = function(){
  clearInterval(clock)
}

//播放音乐时，音乐列表颜色变化,背景图片变化
audio.addEventListener('play',function(){
  ($$('.music-menu li')).forEach(function(ele) {
    ele.classList.remove('active')
  })

  $$('.music-menu li')[currentIndex].classList.add('active')

  $('.cover').style.backgroundImage = 'url('+musicList[currentIndex].imageSrc+')'

})



//自动播放下一首
audio.onended = function() {
  currentIndex = (++currentIndex)%musicList.length
  loadMusic(musicList[currentIndex])
}

//按钮绑定监听事件

//暂停播放
$('.buttons .play').onclick = function() {
  if(audio.paused) {
    this.classList.remove('icon-play')
    this.classList.add('icon-stop')
    audio.play()
  }else{
    this.classList.remove('icon-stop')
    this.classList.add('icon-play')
    audio.pause()
  }
}

//下一首
$('.buttons .forward').onclick = function() {
  currentIndex = (++currentIndex)%musicList.length
  loadMusic(musicList[currentIndex])
}

//上一首
$('.buttons .back').onclick = function() {
  currentIndex = (musicList.length + (--currentIndex))%musicList.length 
  loadMusic(musicList[currentIndex])
}

//进度条事件绑定
$('.bar').onclick = function(event) {
  var percent = event.offsetX / parseInt(getComputedStyle(this).width)
  audio.currentTime = audio.duration * percent
}

