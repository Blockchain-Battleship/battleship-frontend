const noScroll = () => {

    console.log("Hello Pagescroll")
   // 2017 recommended event
 document.body.addEventListener("wheel", function(event){
      event.preventDefault()
   }, false);

 // Before 2017, IE9, Chrome, Safari, Opera
 document.body.addEventListener("mousewheel", function(event){
      event.preventDefault()
   }, false);

 // Old versions of Firefox
 document.body.addEventListener("DOMMouseScroll", function(event){
      event.preventDefault()
   }, false);

document.body.style.overflow = 'hidden';
document.body.style.margin = '0px';
document.body.style.padding = '0px';


}


  
  export default noScroll;
  