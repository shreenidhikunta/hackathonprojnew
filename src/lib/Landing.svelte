<script>
    import { onMount } from 'svelte';

    // --- State Management ---

    // Manages which page is currently visible: 'landing', 'form', or 'roadmap'
    let currentPage = 'landing';

    // Form state variables
    let name = "";
    let goal = "";
    let inspiration = "";
    let dream = "";
    let tasks = "";
    
    // Roadmap and UI state
    let milestones = [];
    let isModalOpen = false;
    let modalData = { text: '', x: 0, y: 0 };
    
    // --- Navigation Functions ---

    const goToPage = (page) => {
        currentPage = page;
        window.scrollTo(0, 0); // Scroll to top on page change
    };

    // --- Form Submission & Roadmap Creation ---

    const handleSubmit = () => {
        // 1. Parse tasks from the textarea into an array of objects
        // We'll assume the first two tasks are complete for demonstration purposes.
        const parsedTasks = tasks.split('\n').filter(t => t.trim() !== '');
        milestones = parsedTasks.map((task, index) => ({
            id: index,
            text: task,
            // Let's mark the first task as complete to show the progress feature
            completed: index < 1, 
        }));
        
        // 2. Switch to the roadmap page
        goToPage('roadmap');
    };

    // --- Roadmap SVG & Modal Logic ---

    let pathEl; // This will be bound to the SVG path element
    let milestoneCoords = []; // To store calculated {x, y} coordinates for milestones
    let progressPathStyle = ''; // To style the progress part of the road
    let finishLinePos = { x: 0, y: 0, rotate: 0 }; // Position for the finish line

    // This is a reactive statement. It re-runs whenever its dependencies (currentPage, pathEl) change.
    $: if (currentPage === 'roadmap' && pathEl && milestones.length > 0) {
        const pathLength = pathEl.getTotalLength();
        
        // Calculate X, Y coordinates for each milestone along the path
        milestoneCoords = milestones.map((_, i) => {
            const distance = pathLength * (i + 0.8) / (milestones.length + 1);
            const point = pathEl.getPointAtLength(distance);
            return { x: point.x, y: point.y };
        });

        // Calculate the length of the "travelled" (darker grey) road
        const completedCount = milestones.filter(m => m.completed).length;
        const progressLength = completedCount > 0 ? pathLength * (completedCount) / (milestones.length + 1) : 0;
        progressPathStyle = `stroke-dasharray: ${pathLength}; stroke-dashoffset: ${pathLength - progressLength};`;

        // Calculate position and angle for the finish line at the end of the path
        const endPoint = pathEl.getPointAtLength(pathLength - 2);
        const nearEndPoint = pathEl.getPointAtLength(pathLength - 20);
        const angle = Math.atan2(endPoint.y - nearEndPoint.y, endPoint.x - nearEndPoint.x) * (180 / Math.PI);
        finishLinePos = { x: endPoint.x, y: endPoint.y, rotate: angle };
    }

    // --- Modal Functions ---

    const showModal = (milestone, coords) => {
        isModalOpen = true;
        // Position modal relative to the milestone circle
        modalData = { text: milestone.text, x: coords.x, y: coords.y };
    };

    const hideModal = () => {
        isModalOpen = false;
    };

</script>

<style>
    /* Using :global to apply styles to the body from within the component */
    :global(body) {
        font-family: 'Inter', sans-serif;
        margin: 0;
        min-height: 100vh;
        background: linear-gradient(45deg, #FDBCB7, #FFF2C5, #E1FFDB, #B8D7FF);
        background-size: 200% 200%;
        animation: gradientShift 12s ease infinite;
        color: #5a4220;
        overflow-x: hidden;
    }

    @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }

    /* --- Page Transitions --- */
    .page {
        animation: fadeIn 0.6s ease-out;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    /* --- Navigation Bar --- */
    nav {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 40px;
        box-sizing: border-box;
    }
    .logo-nav {
        font-family: 'Instrument Serif', serif;
        font-size: 28px;
        font-weight: 700;
        cursor: pointer;
        color: #5a4220;
    }
    nav button {
        background: rgba(255, 255, 255, 0.8);
        border: none;
        padding: 12px 24px;
        border-radius: 9999px; /* Pill shape */
        font-size: 16px;
        font-weight: 600;
        color: #5a4220;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        transition: transform 0.2s, box-shadow 0.2s;
    }
    nav button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(0,0,0,0.12);
    }
    
    /* --- Main Content Area --- */
    .main-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 80vh;
        width: 100%;
        padding: 20px;
        box-sizing: border-box;
    }

    /* --- Info Card (Landing Page) --- */
    .card {
        background: white;
        border-radius: 20px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.1);
        padding: 40px;
        max-width: 600px;
        width: 100%;
        box-sizing: border-box;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .logo {
        display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 20px;
    }
    .logo-text {
        font-family: 'Instrument Serif', serif; font-size: 80px; line-height: 1;
        background: linear-gradient(90deg, #e77885, #f1b389, #FDE1AB, #C2CB84, #A8D0AF, #A9C3CC, #C0B7F1);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: transparent;
    }
    .tagline { margin: 0 0 16px 0; font-size: 24px; font-weight: 600; }
    .description { margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; max-width: 500px; }
    .cta-button {
        background: #5a4220; color: white; border: none; padding: 16px 32px; border-radius: 10px;
        font-size: 18px; font-weight: 600; cursor: pointer; transition: background-color 0.2s, transform 0.2s;
    }
    .cta-button:hover { background: #4a361a; transform: translateY(-2px); }

    /* --- Form Section --- */
    form {
        display: flex; flex-direction: column; gap: 16px; width: 100%; max-width: 600px; padding: 30px;
        background: rgba(255, 255, 255, 0.9); border-radius: 20px; box-shadow: 0 8px 30px rgba(0,0,0,0.1);
        box-sizing: border-box;
    }
    form h2 { text-align: center; margin-top: 0; }
    form input, form textarea {
        width: 100%; padding: 12px 16px; border-radius: 10px; border: 1px solid #ddd;
        font-size: 16px; font-family: 'Inter', sans-serif; box-sizing: border-box;
        transition: border-color 0.2s, box-shadow 0.2s;
    }
    form input:focus, form textarea:focus {
        outline: none; border-color: #A9C3CC; box-shadow: 0 0 0 3px rgba(169, 195, 204, 0.4);
    }
    form textarea { min-height: 120px; resize: vertical; }
    form button {
        background: #5a4220; color: white; border: none; padding: 14px 20px; border-radius: 10px;
        font-size: 16px; font-weight: 600; cursor: pointer; transition: background-color 0.2s, transform 0.2s;
    }
    form button:hover { background: #4a361a; transform: translateY(-2px); }

    /* --- Roadmap Page --- */
    .roadmap-container {
        position: relative;
        width: 100%;
        max-width: 900px;
        margin: 40px 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .roadmap-svg {
        width: 100%;
        height: auto;
        overflow: visible; /* Important for shadows and transforms */
    }
    .road {
        fill: none;
        stroke-linecap: round;
        stroke-linejoin: round;
    }
    .road-bg { stroke: #d1d5db; stroke-width: 25; }
    .road-progress {
        stroke: #6b7280;
        stroke-width: 25;
        transition: stroke-dashoffset 1s ease-in-out;
    }
    .milestone {
        stroke: white;
        stroke-width: 3;
        cursor: pointer;
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .milestone:hover { transform: scale(1.3); }
    .milestone-blue { fill: #60A5FA; }
    .milestone-yellow { fill: #FBBF24; }

    /* Clouds for Dreams/Inspiration */
    .cloud {
        position: absolute;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 50%;
        padding: 30px 40px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        text-align: center;
        width: 150px;
        min-height: 80px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        animation: float 8s ease-in-out infinite;
    }
    .cloud::before, .cloud::after {
        content: '';
        position: absolute;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 50%;
    }
    .cloud::before { width: 100px; height: 100px; top: -40px; left: 30px; }
    .cloud::after { width: 80px; height: 80px; top: -10px; right: 20px; }
    .cloud-title { font-weight: 700; font-size: 14px; margin: 0 0 5px 0; }
    .cloud-text { font-size: 14px; line-height: 1.4; }
    .cloud-1 { top: 15%; left: 5%; }
    .cloud-2 { top: 60%; right: 5%; animation-delay: -4s; }
    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-15px); }
    }
    
    /* Milestone Modal */
    .modal {
        position: fixed;
        background: #333;
        color: white;
        padding: 10px 15px;
        border-radius: 8px;
        font-size: 14px;
        pointer-events: none;
        transform: translate(-50%, -120%); /* Position above the cursor */
        transition: opacity 0.2s;
        z-index: 100;
        white-space: nowrap;
    }

    /* Finish Line */
    .finish-line-group text {
        font-size: 20px;
        font-weight: bold;
        fill: #374151;
        text-anchor: middle;
    }
    .finish-line-group .flag-pole { stroke: #374151; stroke-width: 2; }
    .finish-line-group .flag-check { fill: #374151; }
    .finish-line-group .flag-white { fill: #fff; }

</style>

<!-- ======================= SHARED NAVIGATION ======================= -->
<nav>
    <div class="logo-nav" on:click={() => goToPage('landing')}>prism</div>
    {#if currentPage === 'landing'}
        <button on:click={() => goToPage('form')}>Get Started</button>
    {:else if currentPage === 'form'}
        <button on:click={() => goToPage('landing')}>Back to Home</button>
    {:else}
        <button on:click={() => goToPage('form')}>Edit Plan</button>
    {/if}
</nav>

<!-- ======================= PAGE 1: LANDING PAGE ======================= -->
{#if currentPage === 'landing'}
<div class="page">
    <div class="main-content">
        <div class="card">
            <div class="logo">
                <span class="logo-text">prism</span>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 8V16L12 22L22 16V8L12 2Z" stroke="#C0B7F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 22V12" stroke="#A9C3CC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M22 8L12 12" stroke="#A8D0AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M2 8L12 12" stroke="#e77885" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h2 class="tagline">many dreams, clear path</h2>
            <p class="description">
                Prism is the platform for turning your vision board into action. 
                Start by dropping goals, tasks, and inspiration. Then watch as your ideas transform
                into an actionable path to success.
            </p>
            <button class="cta-button" on:click={() => goToPage('form')}>
                Chart Your Course
            </button>
        </div>
    </div>
</div>
{/if}

<!-- ======================= PAGE 2: FORM PAGE ======================= -->
{#if currentPage === 'form'}
<div class="page">
    <div class="main-content">
        <form on:submit|preventDefault={handleSubmit}>
            <h2>Define Your Vision</h2>
            <input type="text" bind:value={name} placeholder="Your Name" required />
            <input type="text" bind:value={goal} placeholder="What is your main goal?" required />
            <input type="text" bind:value={dream} placeholder="Describe a big dream..." required />
            <input type="text" bind:value={inspiration} placeholder="What inspires you?" required />
            <textarea bind:value={tasks} placeholder="Break it down into actionable tasks, one per line..." required></textarea>
            <button type="submit">Build My Roadmap</button>
        </form>
    </div>
</div>
{/if}

<!-- ======================= PAGE 3: ROADMAP PAGE ======================= -->
{#if currentPage === 'roadmap'}
<div class="page">
    <div class="main-content">
        <div class="roadmap-container">
            
            <!-- Floating Clouds for Dreams & Inspiration -->
            <div class="cloud cloud-1">
                <div class="cloud-title">Dream</div>
                <div class="cloud-text">{dream}</div>
            </div>
            <div class="cloud cloud-2">
                <div class="cloud-title">Inspiration</div>
                <div class="cloud-text">{inspiration}</div>
            </div>

            <!-- SVG for the Road and Milestones -->
            <svg class="roadmap-svg" viewBox="0 0 800 1200">
                <!-- The road path itself. It's bound to the pathEl variable. -->
                <path class="road road-bg" bind:this={pathEl} d="M 400,50 C 100,150 700,250 400,350 C 100,450 700,550 400,650 C 100,750 700,850 400,950 C 100,1050 700,1150 400,1150" />
                <path class="road road-progress" style={progressPathStyle} d="M 400,50 C 100,150 700,250 400,350 C 100,450 700,550 400,650 C 100,750 700,850 400,950 C 100,1050 700,1150 400,1150" />
                
                <!-- Milestones rendered on top of the road -->
                {#each milestones as milestone, i}
                    {#if milestoneCoords[i]}
                        <circle 
                            cx={milestoneCoords[i].x} 
                            cy={milestoneCoords[i].y}
                            r="15"
                            class="milestone {milestone.completed ? 'milestone-blue' : 'milestone-yellow'}"
                            on:mouseenter={() => showModal(milestone, milestoneCoords[i])}
                            on:mouseleave={hideModal}
                        />
                    {/if}
                {/each}

                <!-- Finish Line at the end of the road -->
                {#if finishLinePos.x > 0}
                <g class="finish-line-group" transform="translate({finishLinePos.x}, {finishLinePos.y}) rotate({finishLinePos.rotate})">
                    <text x="0" y="-35" dy=".35em">{goal}</text>
                    <line class="flag-pole" x1="0" y1="0" x2="0" y2="-30" />
                    <rect class="flag-white" x="0" y="-30" width="10" height="10" />
                    <rect class="flag-check" x="10" y="-30" width="10" height="10" />
                    <rect class="flag-check" x="0" y="-20" width="10" height="10" />
                    <rect class="flag-white" x="10" y="-20" width="10" height="10" />
                </g>
                {/if}
            </svg>

            <!-- The Modal popup for milestone details -->
            {#if isModalOpen}
                <div class="modal" style="left: {modalData.x}px; top: {modalData.y}px;">
                    {modalData.text}
                </div>
            {/if}
        </div>
        <button class="cta-button" on:click={() => goToPage('landing')}>
            Start a New Plan
        </button>
    </div>
</div>
{/if}
