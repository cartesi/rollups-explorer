### Cases

Each high level case has a number to it e.g. `[1]`. We're separating the cases per cartesi application, therefore each `[number].application.ts` is the mocked data configuration for each case.

Source reference: [Notion Visualization Scenarios page](https://www.notion.so/Visualization-Scenarios-28ec172ea45080409c08fe7bec4de5f2)

For quick local reference.

<details open>
<summary><b>Cases (Click to toggle)</b></summary>

> - Zero commitments
>   - Open [1]
>   - Closed (and finished → no winner) [2]
> - One commitment
>   - Open [3]
>   - Closed (and finished → with winner) [4]
> - Two commitments
>   - **`TopTournament`:**
>     - `winMatchByTimeout` [5]
>     - `eliminateMatchByTimeout` [6]
>     - `eliminateInnerTournament` [7]
>   - **`MiddleTournament`:**
>     - `winMatchByTimeout` [8]
>     - `eliminateMatchByTimeout` [9]
>     - `eliminateInnerTournament` [10]
>   - **`BottomTournament`:**
>     - `winLeafMatch` [11]
>     - `winMatchByTimeout` [12]
>     - `eliminateMatchByTimeout` [13]
> - Three commitments
>   - Honest joins first, and wins twice: `winLeafMatch` + `winLeafMatch`. [14]
> - Ten commitments (one honest and nine idle Sybils)
>   - Honest eliminates 1 Sybil through `winMatchByTimeout`, and eliminates 8 Sybils through 4x `eliminateMatchByTimeout`. [15]

</details>
