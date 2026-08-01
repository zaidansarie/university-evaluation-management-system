const mysql = require('mysql2/promise');
const http = require('http');

// Rich Data Source for realistic questions
const subjectData = {
  'Programming in C': [
    // Unit 1
    {
      unit: "Unit 1 - Introduction to Programming",
      mcqs: [
        { q: "Who is the creator of the C programming language?", opts: ["Bjarne Stroustrup", "Dennis Ritchie", "James Gosling", "Guido van Rossum"], ans: "B", exp: "C was created by Dennis Ritchie at Bell Labs." },
        { q: "Which of the following is not a valid C keyword?", opts: ["volatile", "sizeof", "virtual", "extern"], ans: "C", exp: "virtual is a keyword in C++, not C." },
        { q: "What is the extension of a C source file?", opts: [".cpp", ".c", ".h", ".obj"], ans: "B", exp: "C source files end with .c" },
        { q: "Which phase of compilation produces the object file?", opts: ["Preprocessing", "Linking", "Assembling", "Compiling"], ans: "C", exp: "The assembler converts assembly to object code." },
        { q: "What is the entry point of a C program?", opts: ["start()", "main()", "init()", "run()"], ans: "B", exp: "Execution begins at main()." }
      ],
      shorts: [
        "Briefly explain the role of a compiler in C programming.",
        "List four valid data types available in C.",
        "What is the difference between a compiler and an interpreter?"
      ],
      longs: [
        "Discuss the step-by-step compilation process of a C program from source code to an executable file.",
        "Explain the basic structure of a C program with an example illustrating preprocessor directives, global declarations, and the main function.",
        "Describe the history and evolution of the C programming language, highlighting its key features that made it popular."
      ],
      numerical: "If an integer is 4 bytes and a char is 1 byte, what is the total memory consumed by an array of 5 integers and 3 characters? Show your calculation."
    },
    // Unit 2
    {
      unit: "Unit 2 - Variables, Data Types and Operators",
      mcqs: [
        { q: "Which operator is used to get the address of a variable?", opts: ["*", "&", "&&", "||"], ans: "B", exp: "The & operator returns the memory address." },
        { q: "What is the result of 5 % 2 in C?", opts: ["2.5", "2", "1", "0"], ans: "C", exp: "Modulo returns the remainder." },
        { q: "Which of the following has the highest precedence?", opts: ["+", "*", "()", "="], ans: "C", exp: "Parentheses have the highest precedence." },
        { q: "What is the format specifier for a float?", opts: ["%d", "%f", "%c", "%s"], ans: "B", exp: "%f is used for floats." },
        { q: "Which bitwise operator performs a logical XOR?", opts: ["&", "|", "^", "~"], ans: "C", exp: "The ^ operator performs Bitwise XOR." }
      ],
      shorts: [
        "Explain the difference between pre-increment and post-increment operators.",
        "What is type casting in C? Provide a brief example.",
        "Define local and global variables."
      ],
      longs: [
        "Explain the different types of operators in C (Arithmetic, Relational, Logical, Bitwise) with an example for each.",
        "Discuss operator precedence and associativity in C. How do they affect the evaluation of complex expressions?",
        "Write a C program to demonstrate the use of implicit and explicit type conversion, and explain the output."
      ],
      numerical: "Evaluate the following C expression given a=5, b=3, c=2: result = a + b * c / (a - b). Show the step-by-step evaluation according to precedence rules."
    },
    // Unit 3
    {
      unit: "Unit 3 - Control Statements",
      mcqs: [
        { q: "Which statement is used to exit a loop prematurely?", opts: ["continue", "break", "exit", "return"], ans: "B", exp: "break exits the innermost loop." },
        { q: "A while loop evaluates its condition...", opts: ["After execution", "Before execution", "During execution", "Never"], ans: "B", exp: "while loop checks condition before executing the body." },
        { q: "Which loop is guaranteed to execute at least once?", opts: ["for", "while", "do-while", "nested for"], ans: "C", exp: "do-while checks condition at the end." },
        { q: "In a switch statement, what is the purpose of the 'default' case?", opts: ["To exit the switch", "To handle non-matching cases", "To start the switch", "It is mandatory for all switches"], ans: "B", exp: "default handles unmatched cases." },
        { q: "What happens if 'break' is omitted in a switch case?", opts: ["Syntax error", "Fall-through to the next case", "Program crashes", "Loop terminates"], ans: "B", exp: "Execution falls through without a break." }
      ],
      shorts: [
        "Differentiate between break and continue statements.",
        "Explain the syntax of a do-while loop.",
        "What is a nested loop? Provide a short example."
      ],
      longs: [
        "Compare and contrast the for, while, and do-while loops in C with flowcharts and syntax.",
        "Explain the switch-case statement. Write a C program to design a simple calculator using switch-case.",
        "Discuss the use of conditional operators (ternary) as an alternative to if-else statements with suitable examples."
      ],
      numerical: "Write a small snippet of C code using a loop to calculate the sum of the first 50 even numbers. State the final expected numerical output."
    },
    // Unit 4
    {
      unit: "Unit 4 - Functions and Arrays",
      mcqs: [
        { q: "Arrays in C are stored in...", opts: ["Non-contiguous memory", "Contiguous memory", "Linked lists", "Trees"], ans: "B", exp: "Arrays use contiguous memory." },
        { q: "What is the index of the first element in a C array?", opts: ["1", "0", "-1", "Depends on declaration"], ans: "B", exp: "C arrays are 0-indexed." },
        { q: "A function that calls itself is known as...", opts: ["Iterative", "Recursive", "Inline", "Static"], ans: "B", exp: "Recursion is when a function calls itself." },
        { q: "Which string function finds the length of a string?", opts: ["strcmp()", "strlen()", "strcat()", "strcpy()"], ans: "B", exp: "strlen() returns string length." },
        { q: "By default, arrays are passed to functions by...", opts: ["Value", "Reference", "Pointer", "Name"], ans: "B", exp: "Arrays degrade to pointers, essentially passing by reference." }
      ],
      shorts: [
        "Define recursion and state its base condition importance.",
        "Explain how a 2D array is declared and initialized in C.",
        "What is the difference between call by value and call by reference?"
      ],
      longs: [
        "Explain the concept of user-defined functions in C. Describe function declaration, definition, and call with an example.",
        "Write a C program to multiply two 3x3 matrices and explain the logic involving nested loops.",
        "Discuss standard library string handling functions in C (strlen, strcpy, strcat, strcmp) with examples."
      ],
      numerical: "Consider an integer array int arr[5] = {10, 20, 30, 40, 50}. If the base address is 1000 and int takes 4 bytes, what is the memory address of arr[3]?"
    },
    // Unit 5
    {
      unit: "Unit 5 - Pointers and File Handling",
      mcqs: [
        { q: "What does the indirection operator (*) do?", opts: ["Gets the address", "Gets the value at the address", "Multiplies two numbers", "Declares a variable"], ans: "B", exp: "It dereferences a pointer." },
        { q: "Which function allocates memory dynamically at runtime?", opts: ["malloc()", "alloc()", "free()", "memalloc()"], ans: "A", exp: "malloc allocates uninitialized memory." },
        { q: "What mode is used to open a file for appending data?", opts: ["w", "r", "a", "a+"], ans: "C", exp: "Mode 'a' is for appending." },
        { q: "Which operator accesses a structure member using a pointer?", opts: [".", "->", "&", "*"], ans: "B", exp: "The arrow operator accesses struct members via pointer." },
        { q: "What happens if you free a pointer twice?", opts: ["Nothing", "Memory leak", "Undefined behavior / crash", "Memory is doubled"], ans: "C", exp: "Double free causes undefined behavior." }
      ],
      shorts: [
        "Explain the concept of a pointer to a pointer.",
        "Differentiate between malloc() and calloc().",
        "How do you define a structure in C?"
      ],
      longs: [
        "Discuss dynamic memory allocation in C. Explain the use of malloc, calloc, realloc, and free with a complete example.",
        "Explain file handling in C. Write a program to read content from one text file and copy it to another.",
        "Compare structures and unions in C. Highlight memory allocation differences with an example."
      ],
      numerical: "A file contains exactly 50 characters. If you use fseek(file_ptr, -10, SEEK_END); what is the new position indicator of the file in bytes from the start?"
    }
  ],
  'Digital Logic': [
    // Unit 1
    {
      unit: "Unit 1 - Number Systems",
      mcqs: [
        { q: "What is the binary equivalent of decimal 13?", opts: ["1101", "1011", "1110", "1001"], ans: "A", exp: "8+4+0+1 = 13" },
        { q: "Which number system uses base 16?", opts: ["Binary", "Octal", "Hexadecimal", "Decimal"], ans: "C", exp: "Hexadecimal is base 16." },
        { q: "What is the 2's complement of 0101?", opts: ["1010", "1011", "1110", "0110"], ans: "B", exp: "Invert (1010) + 1 = 1011." },
        { q: "BCD stands for...", opts: ["Binary Coded Decimal", "Basic Computer Design", "Bit Coded Digit", "Binary Character Decimal"], ans: "A", exp: "BCD = Binary Coded Decimal." },
        { q: "ASCII uses how many bits per character standardly?", opts: ["4", "7", "16", "32"], ans: "B", exp: "Standard ASCII is 7 bits." }
      ],
      shorts: [
        "Convert the hexadecimal number 2A to binary.",
        "Explain the concept of 1's complement.",
        "Why is hexadecimal widely used in computing?"
      ],
      longs: [
        "Explain the process of converting a decimal number with a fractional part into binary, octal, and hexadecimal, using the number 45.625 as an example.",
        "Discuss the significance of the 2's complement representation in computer arithmetic. Show how subtraction is performed using 2's complement.",
        "Write a detailed note on different binary codes: BCD, Gray Code, and Excess-3 code, providing examples for each."
      ],
      numerical: "Calculate the decimal equivalent of the octal number 345. Show all calculation steps."
    },
    // Unit 2
    {
      unit: "Unit 2 - Boolean Algebra",
      mcqs: [
        { q: "According to DeMorgan's theorem, ~(A * B) is equal to:", opts: ["~A * ~B", "~A + ~B", "A + B", "A * B"], ans: "B", exp: "NAND equals Negative-OR." },
        { q: "Which gate is known as the universal gate?", opts: ["AND", "OR", "NAND", "XOR"], ans: "C", exp: "NAND and NOR are universal gates." },
        { q: "A K-Map is used for...", opts: ["Memory mapping", "Simplifying Boolean expressions", "Routing circuits", "Binary addition"], ans: "B", exp: "Karnaugh Maps simplify expressions." },
        { q: "SOP stands for...", opts: ["Sum of Products", "System of Programs", "Sequential Output Process", "Standard Operating Procedure"], ans: "A", exp: "SOP = Sum of Products." },
        { q: "A 3-variable K-Map has how many cells?", opts: ["4", "8", "16", "9"], ans: "B", exp: "2^3 = 8 cells." }
      ],
      shorts: [
        "State DeMorgan's laws.",
        "Draw the truth table for an XOR gate.",
        "What is the difference between SOP and POS forms?"
      ],
      longs: [
        "Explain Karnaugh Maps in detail. How do you use a 4-variable K-Map to minimize a Boolean function? Provide a step-by-step example.",
        "Prove that NAND and NOR are universal logic gates by constructing AND, OR, and NOT gates using only NAND/NOR gates.",
        "Discuss the postulates and fundamental theorems of Boolean algebra. Use them to simplify the expression F = A'BC + AB'C + ABC."
      ],
      numerical: "Minimize the Boolean function F(A,B,C,D) = Σm(0,1,2,5,8,9,10) using a Karnaugh Map and state the final minimized expression."
    },
    // Unit 3
    {
      unit: "Unit 3 - Combinational Logic",
      mcqs: [
        { q: "A multiplexer has how many outputs?", opts: ["Multiple", "Two", "One", "None"], ans: "C", exp: "A MUX has many inputs, one output." },
        { q: "A half adder adds how many bits?", opts: ["1", "2", "3", "4"], ans: "B", exp: "Half adder adds 2 bits." },
        { q: "Which circuit converts binary data to N selection lines?", opts: ["Multiplexer", "Demultiplexer", "Encoder", "Decoder"], ans: "D", exp: "Decoders activate one of 2^N outputs." },
        { q: "To build a 16:1 MUX, how many select lines are needed?", opts: ["2", "3", "4", "16"], ans: "C", exp: "2^4 = 16, so 4 select lines." },
        { q: "A full subtractor requires how many inputs?", opts: ["2", "3", "4", "1"], ans: "B", exp: "A, B, and Borrow-In (3 inputs)." }
      ],
      shorts: [
        "Differentiate between a multiplexer and a demultiplexer.",
        "Explain the logic of a Half Adder with its truth table.",
        "What is a priority encoder?"
      ],
      longs: [
        "Design a Full Adder circuit using basic logic gates. Provide the truth table, K-Map simplification, and the final circuit diagram.",
        "Explain the functioning of a 4-to-16 line decoder. Show how it can be constructed using two 3-to-8 line decoders.",
        "Discuss the implementation of boolean functions using Multiplexers. Show how to implement a 3-variable boolean function using an 8:1 MUX."
      ],
      numerical: "Design a 4-bit binary adder. If the inputs are A=1011 and B=0110, trace the sum and carry out for each stage."
    },
    // Unit 4
    {
      unit: "Unit 4 - Sequential Logic",
      mcqs: [
        { q: "Which component is the basic building block of sequential circuits?", opts: ["Multiplexer", "Flip-Flop", "Decoder", "Gate"], ans: "B", exp: "Flip-flops store state." },
        { q: "The J-K flip-flop toggles when...", opts: ["J=0, K=0", "J=1, K=0", "J=0, K=1", "J=1, K=1"], ans: "D", exp: "1,1 causes a toggle." },
        { q: "Which flip-flop avoids the race-around condition?", opts: ["D flip-flop", "Master-Slave JK flip-flop", "SR flip-flop", "T flip-flop"], ans: "B", exp: "Master-Slave isolates input from output." },
        { q: "A 4-bit shift register can store how many bits?", opts: ["2", "4", "8", "16"], ans: "B", exp: "4 bits." },
        { q: "Counters are an application of...", opts: ["Combinational logic", "Sequential logic", "Analog logic", "Memory mapping"], ans: "B", exp: "Counters rely on previous states." }
      ],
      shorts: [
        "Differentiate between combinational and sequential logic circuits.",
        "Explain the race-around condition in JK flip-flops.",
        "What is a shift register? List its types."
      ],
      longs: [
        "Explain the working of a Master-Slave JK flip-flop with a neat logic diagram and timing waveforms. How does it resolve the race-around condition?",
        "Design a 3-bit synchronous UP counter using T flip-flops. Provide the state table, K-maps, and the logic diagram.",
        "Discuss the operation of a Universal Shift Register that can shift left, shift right, parallel load, and retain state."
      ],
      numerical: "For a 4-bit asynchronous ripple counter initially at 0000, what will be the state of the counter after 11 clock pulses? Show binary conversion."
    },
    // Unit 5
    {
      unit: "Unit 5 - Memory Devices",
      mcqs: [
        { q: "Which memory is volatile?", opts: ["ROM", "EPROM", "RAM", "Flash"], ans: "C", exp: "RAM loses data when powered off." },
        { q: "PROM stands for...", opts: ["Primary Read Only Memory", "Programmable Read Only Memory", "Perfect Random Output Memory", "Pulse Rate Output Machine"], ans: "B", exp: "Programmable ROM." },
        { q: "Which component allows wiping memory using UV light?", opts: ["SRAM", "DRAM", "EPROM", "EEPROM"], ans: "C", exp: "EPROM is erased with UV." },
        { q: "SRAM is faster than DRAM because it uses...", opts: ["Capacitors", "Flip-Flops", "Magnetic disks", "Optical lasers"], ans: "B", exp: "SRAM uses flip-flops (transistors)." },
        { q: "PLA is a programmable logic device with...", opts: ["Fixed AND, Programmable OR", "Programmable AND, Programmable OR", "Programmable AND, Fixed OR", "Fixed AND, Fixed OR"], ans: "B", exp: "PLA has both arrays programmable." }
      ],
      shorts: [
        "Differentiate between SRAM and DRAM.",
        "Explain the structure of a ROM.",
        "What is a Programmable Logic Array (PLA)?"
      ],
      longs: [
        "Discuss the memory hierarchy in modern computer systems, explaining the speed, cost, and size trade-offs between Registers, Cache, RAM, and Disk.",
        "Explain the internal architecture of a Programmable Logic Array (PLA) and a Programmable Array Logic (PAL). Compare the two.",
        "Write a comprehensive overview of semiconductor memory technologies (ROM, PROM, EPROM, EEPROM, and Flash), highlighting their write/erase mechanisms."
      ],
      numerical: "A memory chip is specified as 64K x 8. How many address lines and data lines does this chip require?"
    }
  ],
  'Mathematics-I': [
    // Unit 1
    {
      unit: "Unit 1 - Calculus",
      mcqs: [
        { q: "What is the limit of sin(x)/x as x approaches 0?", opts: ["0", "1", "Infinity", "Undefined"], ans: "B", exp: "Standard limit." },
        { q: "The derivative of e^x is...", opts: ["x*e^x", "e^x", "e^(x-1)", "ln(x)"], ans: "B", exp: "e^x is its own derivative." },
        { q: "Integration is geometrically equivalent to finding...", opts: ["Slope", "Area under curve", "Tangent line", "Volume"], ans: "B", exp: "Definite integral represents area." },
        { q: "Maclaurin series is a special case of Taylor series centered at...", opts: ["x = 1", "x = 0", "x = a", "Infinity"], ans: "B", exp: "Maclaurin series expands at 0." },
        { q: "If a function is continuous at a point, it must be differentiable there.", opts: ["True in all cases", "False", "True only for polynomials", "True only at x=0"], ans: "B", exp: "Continuous doesn't mean differentiable (e.g., |x| at 0)." }
      ],
      shorts: [
        "State Rolle's Theorem.",
        "Define the first derivative test for local extrema.",
        "Write down the Taylor series expansion formula."
      ],
      longs: [
        "State and prove the Mean Value Theorem. Discuss its geometrical interpretation with a suitable graph.",
        "Explain the concepts of maxima, minima, and points of inflection for a function of a single variable. Use f(x) = x^3 - 3x as an example.",
        "Discuss the application of Taylor's and Maclaurin's series. Expand the function f(x) = sin(x) up to the 5th power of x."
      ],
      numerical: "Evaluate the definite integral of f(x) = 3x^2 + 2x from x=1 to x=3. Show all integration steps."
    },
    // Unit 2
    {
      unit: "Unit 2 - Linear Algebra",
      mcqs: [
        { q: "A matrix with a determinant of 0 is called...", opts: ["Identity", "Singular", "Orthogonal", "Symmetric"], ans: "B", exp: "Singular matrices have det = 0." },
        { q: "The trace of a matrix is the sum of its...", opts: ["All elements", "Diagonal elements", "Row elements", "Column elements"], ans: "B", exp: "Trace is sum of main diagonal." },
        { q: "Eigenvalues are roots of the...", opts: ["Characteristic equation", "Polynomial equation", "Linear equation", "Differential equation"], ans: "A", exp: "det(A - lambda*I) = 0." },
        { q: "For a matrix A, A*A^T = I implies A is...", opts: ["Symmetric", "Orthogonal", "Skew-symmetric", "Diagonal"], ans: "B", exp: "Definition of an orthogonal matrix." },
        { q: "The rank of a matrix is the number of...", opts: ["Zeros", "Non-zero rows in echelon form", "Columns", "Diagonal elements"], ans: "B", exp: "Rank corresponds to independent rows." }
      ],
      shorts: [
        "Define the rank of a matrix.",
        "What are eigenvalues and eigenvectors?",
        "State the Cayley-Hamilton theorem."
      ],
      longs: [
        "Explain the process of finding the inverse of a 3x3 matrix using the Gauss-Jordan elimination method. Provide a step-by-step example.",
        "Discuss the physical and geometric significance of Eigenvalues and Eigenvectors. Prove that eigenvectors corresponding to distinct eigenvalues are linearly independent.",
        "Explain how matrix rank determines the consistency of a system of linear equations (Rouche-Capelli theorem)."
      ],
      numerical: "Find the eigenvalues of a 2x2 matrix with elements: row1=[4, 1], row2=[2, 3]. Show the characteristic equation."
    },
    // Unit 3
    {
      unit: "Unit 3 - Differential Equations",
      mcqs: [
        { q: "The order of a differential equation is determined by...", opts: ["Highest power", "Highest derivative", "Number of variables", "Constants"], ans: "B", exp: "Order = highest derivative." },
        { q: "An integrating factor is used to solve...", opts: ["Linear ODEs", "Non-linear ODEs", "Algebraic equations", "Integrals"], ans: "A", exp: "Used for 1st order linear ODEs." },
        { q: "The Laplace transform of 1 is...", opts: ["1/s", "s", "1/s^2", "e^s"], ans: "A", exp: "L{1} = 1/s." },
        { q: "A differential equation is exact if...", opts: ["M_y = N_x", "M_x = N_y", "M = N", "M_y = -N_x"], ans: "A", exp: "Partial derivative condition for exactness." },
        { q: "The complementary function (CF) represents the solution to the...", opts: ["Non-homogeneous part", "Homogeneous part", "Particular integral", "Initial condition"], ans: "B", exp: "CF is for RHS = 0." }
      ],
      shorts: [
        "What is the difference between order and degree of a differential equation?",
        "Define an integrating factor.",
        "What is the physical interpretation of an initial value problem?"
      ],
      longs: [
        "Explain the method of solving first-order linear differential equations using an integrating factor. Derive the general formula.",
        "Discuss the use of the Laplace Transform in solving linear differential equations with constant coefficients. List standard Laplace transform formulas.",
        "Explain the concepts of Complementary Function (CF) and Particular Integral (PI) in solving second-order linear non-homogeneous differential equations."
      ],
      numerical: "Solve the differential equation dy/dx + 2y = 4 given the initial condition y(0) = 1. Show the integrating factor."
    },
    // Unit 4
    {
      unit: "Unit 4 - Probability",
      mcqs: [
        { q: "The probability of an impossible event is...", opts: ["1", "-1", "0", "0.5"], ans: "C", exp: "Probability bounds are 0 to 1." },
        { q: "Bayes' theorem is used to calculate...", opts: ["Total probability", "Conditional probability", "Prior probability", "Variance"], ans: "B", exp: "Revises probabilities based on new evidence." },
        { q: "For a continuous random variable, the integral of its PDF over all space is...", opts: ["0", "Infinity", "1", "Mean"], ans: "C", exp: "Total probability is 1." },
        { q: "Two events A and B are independent if P(A n B) equals...", opts: ["P(A) + P(B)", "P(A) * P(B)", "P(A) / P(B)", "0"], ans: "B", exp: "Definition of independence." },
        { q: "Expected value E[X] is equivalent to...", opts: ["Median", "Mode", "Mean", "Variance"], ans: "C", exp: "E[X] is the mean." }
      ],
      shorts: [
        "State Bayes' Theorem.",
        "Differentiate between discrete and continuous random variables.",
        "What is the difference between mutually exclusive and independent events?"
      ],
      longs: [
        "Explain Bayes' Theorem and its applications in real-world scenarios. Provide an example problem solving for posterior probability.",
        "Discuss the properties of Probability Density Functions (PDF) and Cumulative Distribution Functions (CDF) for continuous random variables.",
        "Explain the concepts of Expected Value and Variance. Prove that Var(X) = E[X^2] - (E[X])^2."
      ],
      numerical: "A bag contains 3 red and 5 black balls. If two balls are drawn at random without replacement, what is the probability that both are red?"
    },
    // Unit 5
    {
      unit: "Unit 5 - Statistics",
      mcqs: [
        { q: "The square root of variance is...", opts: ["Mean", "Standard Deviation", "Mode", "Median"], ans: "B", exp: "SD is the square root of variance." },
        { q: "A normal distribution is symmetric about its...", opts: ["Mean", "Standard Deviation", "Variance", "Origin"], ans: "A", exp: "The bell curve is symmetric around the mean." },
        { q: "In a binomial distribution, the trials must be...", opts: ["Dependent", "Infinite", "Independent", "Continuous"], ans: "C", exp: "Bernoulli trials are independent." },
        { q: "Type I error in hypothesis testing is...", opts: ["Rejecting true null hypothesis", "Accepting false null hypothesis", "Rejecting false null hypothesis", "Accepting true null hypothesis"], ans: "A", exp: "False positive." },
        { q: "The standard normal distribution has a mean of...", opts: ["1", "0", "-1", "Infinity"], ans: "B", exp: "Z-distribution has mean 0." }
      ],
      shorts: [
        "Define standard deviation and variance.",
        "What are the characteristics of a Normal Distribution?",
        "Explain Type I and Type II errors in hypothesis testing."
      ],
      longs: [
        "Explain the Binomial and Poisson distributions. Under what conditions does the Binomial distribution approximate the Poisson distribution?",
        "Discuss the properties and significance of the Normal Distribution curve in statistical analysis. What is the Empirical Rule (68-95-99.7 rule)?",
        "Explain the complete process of Hypothesis Testing, including defining the null and alternative hypotheses, level of significance, test statistic, and critical regions."
      ],
      numerical: "A factory produces bulbs with a mean lifespan of 800 hours and a standard deviation of 40 hours. Calculate the Z-score for a bulb that lasts 860 hours."
    }
  ]
};

const questionsArr = [];

// Helper to generate the exact 12 questions per unit
function generateUnitQuestions(subject, subjectId, unitObj, facultyId) {
    const qList = [];
    let qCount = 1;
    const sName = subject;
    const uName = unitObj.unit;

    const codePrefix = sName === 'Programming in C' ? 'C' : sName === 'Digital Logic' ? 'DL' : 'MAT';

    // 5 MCQs
    unitObj.mcqs.forEach((mcq, idx) => {
        qList.push({
            question_code: `${codePrefix}_${uName.split(' ')[1]}_M${idx+1}`,
            subject_id: subjectId,
            unit: uName,
            question_text: mcq.q,
            question_type: 'MCQ',
            blooms_level: ['Remember', 'Understand', 'Apply'][idx % 3], // Mix blooms
            difficulty_level: ['Easy', 'Medium'][idx % 2],
            marks: 1, // MCQ usually 1 or 2
            status: 'Approved',
            created_by: facultyId,
            option_a: mcq.opts[0],
            option_b: mcq.opts[1],
            option_c: mcq.opts[2],
            option_d: mcq.opts[3],
            correct_answer: mcq.ans,
            explanation: mcq.exp
        });
    });

    // 3 Short Answers
    unitObj.shorts.forEach((sh, idx) => {
        qList.push({
            question_code: `${codePrefix}_${uName.split(' ')[1]}_S${idx+1}`,
            subject_id: subjectId,
            unit: uName,
            question_text: sh,
            question_type: 'Short Answer',
            blooms_level: ['Understand', 'Apply', 'Analyze'][idx % 3],
            difficulty_level: 'Medium',
            marks: 3,
            status: 'Approved',
            created_by: facultyId,
            option_a: null, option_b: null, option_c: null, option_d: null, correct_answer: null, explanation: null
        });
    });

    // 3 Long Answers
    unitObj.longs.forEach((lg, idx) => {
        qList.push({
            question_code: `${codePrefix}_${uName.split(' ')[1]}_L${idx+1}`,
            subject_id: subjectId,
            unit: uName,
            question_text: lg,
            question_type: 'Long Answer',
            blooms_level: ['Analyze', 'Evaluate', 'Create'][idx % 3],
            difficulty_level: 'Hard',
            marks: 10,
            status: 'Approved',
            created_by: facultyId,
            option_a: null, option_b: null, option_c: null, option_d: null, correct_answer: null, explanation: null
        });
    });

    // 1 Numerical
    qList.push({
        question_code: `${codePrefix}_${uName.split(' ')[1]}_N1`,
        subject_id: subjectId,
        unit: uName,
        question_text: unitObj.numerical,
        question_type: 'Numerical',
        blooms_level: 'Apply',
        difficulty_level: 'Medium',
        marks: 5,
        status: 'Approved',
        created_by: facultyId,
        option_a: null, option_b: null, option_c: null, option_d: null, correct_answer: null, explanation: null
    });

    return qList;
}


async function main() {
    console.log("Connecting to database...");
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'zai827--',
        database: 'university_evaluation_system'
    });

    // We need to fetch subjects (Programming in C, Digital Logic, Mathematics-I)
    const [subjRows] = await connection.execute("SELECT id, subject_name, faculty_id FROM subjects WHERE subject_name IN ('Programming in C', 'Digital Logic', 'Mathematics-I')");
    
    if (subjRows.length < 3) {
        console.warn(`Found only ${subjRows.length} subjects! Expected 3.`);
    }

    let allQuestions = [];

    subjRows.forEach(subj => {
        console.log(`Generating 60 questions for ${subj.subject_name}...`);
        const subData = subjectData[subj.subject_name];
        if (!subData) return;

        subData.forEach(unitObj => {
            const unitQuestions = generateUnitQuestions(subj.subject_name, subj.id, unitObj, subj.faculty_id);
            allQuestions = allQuestions.concat(unitQuestions);
        });
    });
    
    await connection.end();

    console.log(`Total questions generated: ${allQuestions.length}`);

    // Push to API in bulk
    const postData = JSON.stringify({ questions: allQuestions });
    
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/questions/bulk',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'x-user-role': 'admin'
            // Multi-tenant university-id if needed, but questions table doesn't have it by default
        }
    };

    console.log("Sending bulk upload request to API...");
    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                console.log("Success:", JSON.parse(data));
            } else {
                console.error(`Failed! Status: ${res.statusCode}, Body: ${data}`);
            }
        });
    });

    req.on('error', (e) => console.error("HTTP Request Error:", e));
    req.write(postData);
    req.end();
}

main().catch(console.error);
