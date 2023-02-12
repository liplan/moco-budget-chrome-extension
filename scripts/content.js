// get the personal token from Moco > Profil > Integrationen > Persönlicher API Schlüssel
const MOCOTOKEN = "5afe04983bdadb254965e76837cea8b7";

// inject the data into the DOM
async function inject() {
  
  const heading = document.getElementsByClassName("third")[0];
  const tempDiv = document.createElement('div');

  if(heading == undefined) { return; }

  let data = await getSelectedProject();
  
  heading.innerHTML = "";

  const alarm = data.budget_progress_in_percentage >= 80 ? true : false;
  const color = alarm ? "red" : "green";
  const borderColor = alarm ? "red" : "#cecece";
  
  document.querySelectorAll("textarea")[0].style = "border: 2px solid "+borderColor;
  

  tempDiv.className = "py-4";
  tempDiv.style = "font-size: 20px; font-weight: 700; color: " +color+ "; text-align: center;";

  
  tempDiv.innerHTML = data.budget_progress_in_percentage+"% des Budgets verbraucht.";
  heading.insertAdjacentElement("afterbegin", tempDiv);
  
}

// get the data from chosen project
async function getSelectedProject() {
  let id = null;
  document.querySelectorAll("input").
  forEach((input) => { 
    if (input.name == "projectId") {
        id = input.value;
    }
  });   
  console.log("chosen project id: " + id);
  
  if(id != null){

    var uri = "https://klickmeister.mocoapp.com/api/v1/projects/" + id + "/report";
    let data = await fetch(uri, {
        headers: {
            "Accept": "*/*",
            "Authorization": "Token token="+MOCOTOKEN
        }
    }).then((response) => response.json());
    console.log(data);
    return    data; 
  }

}

// setting an observer 
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    // console.log('Mutation type: ' + mutation.type);
    if ( mutation.type == 'childList' ) {
      if (mutation.addedNodes.length >= 1) {
        if (mutation.addedNodes[0].nodeName != '#text') {
           // console.log('Added ' + mutation.addedNodes[0].tagName + ' tag.');
        }
      }
      else if (mutation.removedNodes.length >= 1) {
         // console.log('Removed ' + mutation.removedNodes[0].tagName + ' tag.')
      }
    }
     if (mutation.type == 'attributes') {
      console.log('Attribute ' + mutation.attributeName + ' changed.');
      inject();     
    } 
  });   
});

var observerConfig = {
        attributes: true,
        childList: false,
        characterData: false
};




// Listen to all changes to body and child nodes
setTimeout(function() {
  var targetNode = document.getElementsByName("projectId")[0];
  observer.observe(targetNode, observerConfig);
}, 1000);

// start the injection
setTimeout(inject, 1000);

// Listen to all changes to body and child nodes 
const observeUrlChange = () => {
  let oldHref = document.location.href;
  const body = document.querySelector("body");
  const observer = new MutationObserver(mutations => {
      mutations.forEach((mutation) => {
        if (oldHref !== document.location.href) {
          oldHref = document.location.href;
          console.log("inject now");
          setTimeout(inject, 1000);
        }

        if (mutation.type == 'attributes' && mutation.attributeName == "value") {
          console.log('Attribute ' + mutation.attributeName + ' changed.');
          console.log("inject now");
          setTimeout(inject, 1000);  
        } 

      });
    });
    observer.observe(body, { childList: true, subtree: true, attributes: true });
};
window.onload = observeUrlChange;
