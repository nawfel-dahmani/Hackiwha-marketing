const startBtn = document.getElementById("start-btn");

const welcomeScreen =
document.getElementById("welcome-screen");

const questionScreen =
document.getElementById("question-screen");

const progressFill =
document.getElementById("progress-fill");



const resultScreen = document.getElementById("result-screen");

startBtn.addEventListener("click",function(){

    welcomeScreen.style.display="none";

    questionScreen.style.display="flex";

});

const options =
document.querySelectorAll(".option");

const nextBtn =
document.getElementById("next-btn");

nextBtn.style.opacity = "0.5";
nextBtn.style.pointerEvents = "none";

const questions = [

{
    key: "industry",
    title: "What industry is your startup in?",
    options: ["SaaS","E-commerce","Education","Healthcare"]
},

{
    key: "stage",
    title: "What stage is your startup?",
    options: ["Idea","MVP","Launched"]
},

{
    key: "budget",
    title: "How much budget do you have?",
    options: ["<$100","$100-$500","$500-$1000",">$1000"]
},

{
    key: "teamSize",
    title: "How many team members?",
    options: ["Solo","2-3","4-6","7+"]
},

{
    key: "goal",
    title: "What is your main goal?",
    options: ["Branding","Marketing","Sales","Validation"]
}

];

let currentQuestion = 0;

const answers = {};

const questionTitle = document.getElementById("question-title");

const optionsContainer = document.getElementById("options-container");

const loadingScreen =
document.getElementById("loading-screen");



function displayQuestion() {

    questionTitle.textContent = questions[currentQuestion].title;

    optionsContainer.innerHTML = "";

    nextBtn.style.opacity = "0.5";
    nextBtn.style.pointerEvents = "none";

    questions[currentQuestion].options.forEach(function(option) {

        optionsContainer.innerHTML += `
            <button class="option">${option}</button>
        `;

        let percentage =
 ((currentQuestion + 1) / questions.length) * 100;

 progressFill.style.width = percentage + "%";

    });

    // Attach click events to the NEW buttons
    const options = document.querySelectorAll(".option");
   

    options.forEach(function(option){

        option.addEventListener("click", function(){

            options.forEach(function(btn){
                btn.classList.remove("selected");
            });

            option.classList.add("selected");

            answers[questions[currentQuestion].key] = option.textContent;

            nextBtn.style.opacity = "1";
            nextBtn.style.pointerEvents = "auto";

        });

    });

}

displayQuestion();

nextBtn.addEventListener("click", function(){

    console.log(answers);

    currentQuestion++;



    if(currentQuestion < questions.length){

        displayQuestion();

    }else{

    questionScreen.style.display = "none";

    loadingScreen.style.display = "flex";

    setTimeout(function(){

        loadingScreen.style.display = "none";

        resultScreen.style.display = "flex";

        document.getElementById("results").innerHTML = `
            <p><strong>Industry:</strong> ${answers.industry}</p>
            <p><strong>Stage:</strong> ${answers.stage}</p>
            <p><strong>Budget:</strong> ${answers.budget}</p>
            <p><strong>Team Size:</strong> ${answers.teamSize}</p>
            <p><strong>Goal:</strong> ${answers.goal}</p>
        `;

    },2000);

}
});