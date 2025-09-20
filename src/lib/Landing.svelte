<script>
    export let g1 = 'FDBCB7';
    export let g2 = 'FFF2C5';
    export let g3 = 'E1FFDB';
    export let g4 = '#B8D7FF';
    import prismlogo from '../assets/prismlogo.png'; 
    let name = "";
    let goal = "";
    let inspiration = "";
    let dream = "";
    let tasks = "";

    const handleSubmit = (event) => {
    event.preventDefault();  
    console.log({ goal, inspiration, dream, tasks });  
    alert(`Thanks for submitting, ${name}!`);   
    };

</script>

<style>
    :global(body)
    {
        .instrument-serif {
        font-family: 'Instrument Serif', serif;
        }

        /*---- background ----*/
        margin: 0;
       
        background: linear-gradient(45deg, #FDBCB7, #FFF2C5, #E1FFDB, #B8D7FF);
        background-size: 200% 200%;
        animation: gradientShift 12s ease infinite;
    }

    @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }

    /*---navigation ----*/

    nav {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 20px;
    }

    nav button {
        width: 200px;
        height: 60px;
        background: white;
        border: none;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        transition: transform 0.2s
    }

    nav button:hover{
        transform: scale(1.05);
    }

    /* ----- main content ---- */
    .main {
        display:flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 60px 20px;
    }


  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 150px;
    
  }


  .tagline {
    margin-top: 16px;
    font-size: 28px;
    font-weight: 500;
    color: #5a4220;
  }

   .description {
    margin-top: 16px;
    font-size: 16px;
    color: #5a4220;
    max-width: 500px;
  }

  .card {
    background: white;
    border-radius: 5px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    padding: 5px 0px 10px 5px;
    margin: 40px 0 40px 0;
    max-width: none;
    width: 95%;
    text-align: left;
    height: 600px;
}

.instrument-serif{
    font-size: 180px;
}

.gradient-text
{
    background: linear-gradient(90deg, #e77885, #f1b389, #FDE1AB, #C2CB84, #A8D0AF, #A9C3CC, #C0B7F1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  padding-left: 100px;
  padding-bottom: 0px;
  
}

.card .tagline 
{
    padding: top: 0px;
    padding-left: 100px;
    font-size: 50px;
}

.card .description
{
    padding-left: 100px;
    font-size: 20px;  
    overflow-wrap: break-word;
    
}


</style>

<!-- ---------------- NAV ---------------- -->

<!-- ---------------- MAIN CONTENT ---------------- -->
<!-- ---------------- WHITE CARD ---------------- -->

<nav>
  <button on:click = {goToProduct}>get started</button>
</nav>


<div class="card">
  <div class="logo">
    <span class="instrument-serif gradient-text">prism</span>
    <!-- replace with your prism/crystal image -->
    <img class = "logo"
      src={prismlogo}
      alt="prism icon" 
      width="60"
    />
    <form on:submit={handleSubmit}>
  <input type="text" bind:value={goal} placeholder="Goal" required />
  <input type="number" bind:value={dream} placeholder="Dream" required />
  <input type="Inspiration" bind:value={inspiration} placeholder="Email" required />
  <textarea bind:value={tasks} placeholder="task"></textarea>
  <button type="submit">Submit</button>
</form>



  </div>

  <div class="tagline">many dreams, clear path</div>

  <p class="description">
    Prism is the platform for turning your vision board into action. 
    Start by
    dropping goals, tasks, and inspiration. Then watch as your ideas transform
    into an actionable path to success.
  </p>
</div>





