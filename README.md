Page Replacement Simulator

A Visual Analysis Tool for Operating System Memory Management

📍 Project Overview

The Page Replacement Simulator is a specialized interactive web application designed to demonstrate the mechanics of Operating System memory management. In modern computing, efficient memory utilization is critical; when main memory is full, the OS must decide which page to swap out to make room for incoming data. This decision is governed by Page Replacement Algorithms.

This project serves as an educational and analytical tool, allowing users to visualize these abstract algorithmic processes in real-time. By transforming static theoretical concepts into dynamic, step-by-step simulations, it aids students, educators, and developers in understanding the efficiency and behavior of different memory management strategies.

🧠 Algorithmic Logic

The simulator implements four distinct algorithms, offering a comparative analysis of their performance based on Hit/Fault ratios.

1. First-In-First-Out (FIFO)

The simplest page replacement algorithm. It treats the memory frames as a circular queue. When a page needs to be replaced, the algorithm selects the page that has been in memory the longest. While low-overhead, it may suffer from Belady's Anomaly, where increasing the number of frames results in more page faults.

2. Least Recently Used (LRU)

This algorithm approximates the optimal algorithm by assuming that pages used recently will likely be used again soon. It replaces the page that has not been used for the longest period. It is widely used in practice but requires hardware assistance or expensive overhead to track the age of pages.

3. Optimal (OPT)

Also known as Belady's Algorithm, this theoretical approach replaces the page that will not be used for the longest period in the future. It guarantees the lowest possible page-fault rate for a fixed number of frames. Since it requires future knowledge of the reference string, it is primarily used as a benchmark to measure the efficiency of other algorithms.

4. Clock (Second Chance)

An efficient approximation of LRU. It maintains a circular list of pages in memory, with a "reference bit" for each. The algorithm uses a pointer (clock hand) to iterate through the pages. If a page's reference bit is 1, it is given a second chance (bit set to 0) and the pointer moves on. If the bit is 0, that page is replaced. This balances performance with implementation cost.

✨ Key Features

Dynamic Visualization: Renders a step-by-step grid showing the state of every memory frame at each interval of the reference string.

Real-time Analytics: Automatically calculates and displays Total Hits, Total Faults, Hit Ratio, and Fault Ratio for immediate performance assessment.

Customizable Parameters: Supports variable Frame Counts (1-100) and custom Reference Strings of arbitrary length.

Responsive Interface: Built with a fluid design system to ensure accessibility across desktop monitors, tablets, and mobile devices.

🛠️ Technical Architecture

This application is engineered using a modern frontend stack to ensure performance and maintainability:

Core Framework: React.js (Vite ecosystem) for component-based architecture and state management.

Styling Engine: Tailwind CSS for utility-first, responsive design.

Iconography: Lucide React for consistent UI elements.

Algorithm Implementation: Native JavaScript implementation of circular buffers, queue logic, and look-ahead heuristics.