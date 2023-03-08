// get the personal token from Moco > Profil > Integrationen > Persönlicher API Schlüssel
const MOCOTOKEN = "YOUR TOKEN";
const SUBDOMAIN = "YOUR SUBDOMAIN";

// inject the data into the DOM
async function inject() {
  
  //const heading = document.getElementsByClassName("third")[0];
  const projectIdElement = document.querySelector('.tst-project-id .group');
  const tempDiv = document.createElement('div');

  if(projectIdElement == undefined) { return; }

  projectIdElement.querySelector('.budget_budget_percentage')?.remove();

  let data = await getSelectedProject();

  const alarm = data.budget_progress_in_percentage >= 80;
  const reachingAlarm = data.budget_progress_in_percentage >= 30;
  const textClassname = alarm
    ? 'text-danger'
    : reachingAlarm
      ? 'text-warning'
      : 'text-success';

  tempDiv.className = 'budget_budget_percentage ml-auto pl-1 text-sm ' + textClassname;
  tempDiv.innerText = '| ' + data.budget_progress_in_percentage + '%';

  projectIdElement.appendChild(tempDiv);
}

// get the data from chosen project
async function getSelectedProject() {
  const id = document.querySelector("input[name='projectId']")?.value;
  console.log("chosen project id: " + id);

  if (id) {
    const respData = await fetch("/graphql", {
      "headers": {
        "accept": "*/*",
        "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
        "content-type": "application/json",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-client-version": "467.9",
        "x-csrf-token": document.querySelector('meta[name="csrf-token"]').content,
      },
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": "{\"operationName\":\"QueryGetProjects\",\"variables\":{\"ids\":[\"" + id + "\"]},\"query\":\"query QueryGetProjects($ids: [ID!]) {\\n  projects(\\n    ids: $ids) {}\\n    __typename\\n  }\\n}\\n\"}",
      "method": "POST",
      "mode": "cors",
      "credentials": "include"
    }).then((resp) => resp.json());

    return {
      budget_progress_in_percentage: respData.data.projects.collection[0].budgetProgress,
    };
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