document.addEventListener("DOMContentLoaded", () => {
    const areaOfInterestSelect = document.getElementById("areaOfInterest");
    const mentorSelect = document.getElementById("mentor");
    const durationSelect = document.getElementById("duration");
    const timeSlotSelect = document.getElementById("timeSlots");
    const scheduleBtn = document.getElementById("scheduleBtn");
    const paymentSection = document.getElementById("payment");
    const paymentDetails = document.getElementById("paymentText");

    let areasOfInterest = [];
    let mentors = {};
    let timeSlots = [];
    const bookedSlots = {};

    // Fetch data from JSON
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
console.log(response.json);
        })
        .then(data => {
            areasOfInterest = data.areasOfInterest;
            mentors = data.mentors;
            timeSlots = data.timeSlots;

            populateAreasOfInterest();
            populateTimeSlots();
        })
        .catch(error => console.error('Error loading data:', error));

    // Populate Areas of Interest
    function populateAreasOfInterest() {
        areaOfInterestSelect.innerHTML = '<option value="">Select an area of interest</option>'; // Default option
        areasOfInterest.forEach(area => {
            const option = document.createElement("option");
            option.value = area;
            option.textContent = area;
            areaOfInterestSelect.appendChild(option);
        });
    }

    // Handle Area of Interest Change
    areaOfInterestSelect.addEventListener("change", () => {
        mentorSelect.innerHTML = '<option value="Any Available Mentor">Any Available Mentor</option>';
        const selectedArea = areaOfInterestSelect.value;
        if (selectedArea && mentors[selectedArea]) {
            mentors[selectedArea].forEach(mentor => {
                const option = document.createElement("option");
                option.value = mentor;
                option.textContent = mentor;
                mentorSelect.appendChild(option);
            });
        }
    });

    // Populate Time Slots
    function populateTimeSlots() {
        timeSlotSelect.innerHTML = '<option value="">Select a time slot</option>'; // Default option
        timeSlots.forEach(slot => {
            const option = document.createElement("option");
            option.value = slot;
            option.textContent = slot;
            timeSlotSelect.appendChild(option);
        });
    }

    // Schedule Button Click
    scheduleBtn.addEventListener("click", () => {
        const selectedArea = areaOfInterestSelect.value;
        let selectedMentor = mentorSelect.value;
        const duration = parseInt(durationSelect.value);
        const selectedTimeSlot = timeSlotSelect.value;

        if (!selectedArea || !duration || !selectedTimeSlot) {
            alert("Please select all fields.");
            return;
        }

        // Automatically select mentor if "Any Available Mentor" is chosen
        if (selectedMentor === "Any Available Mentor") {
            selectedMentor = assignMentor(selectedArea, selectedTimeSlot);
            if (selectedMentor) {
                mentorSelect.value = selectedMentor; // Update dropdown to reflect the selected mentor
            } else {
                alert("No available mentors for the selected area and time slot.");
                return;
            }
        } else {
            if (!bookedSlots[selectedMentor]) {
                bookedSlots[selectedMentor] = [];
            }
            bookedSlots[selectedMentor].push(selectedTimeSlot);
        }

        // Payment Calculation
        const isPremium = mentorSelect.value !== "Any Available Mentor";
        let baseCost = 0;

        switch (duration) {
            case 30:
                baseCost = 2000;
                break;
            case 45:
                baseCost = 3000;
                break;
            case 60:
                baseCost = 4000;
                break;
            default:
                baseCost = 2000; // Default to 30 mins cost if something goes wrong
        }

        const cost = isPremium ? baseCost + 1000 : baseCost;

        // Display Payment Section
        paymentDetails.textContent = `The cost for a ${duration}-minute session with ${selectedMentor} is Rs. ${cost}`;
        paymentSection.style.display = "block";
    });

    function assignMentor(area, timeSlot) {
        const availableMentors = mentors[area];
        if (!availableMentors) return null;

        for (let mentor of availableMentors) {
            if (!bookedSlots[mentor]) {
                bookedSlots[mentor] = [];
            }
            if (!isMentorBookedAt(mentor, timeSlot)) {
                bookedSlots[mentor].push(timeSlot);
                return mentor;
            }
        }
        return null; // Return null if no mentor is available
    }

    function isMentorBookedAt(mentor, timeSlot) {
        return bookedSlots[mentor] && bookedSlots[mentor].includes(timeSlot);
    }
});
