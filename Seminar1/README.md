# Luka Doncic Shooting Chart Visualization

My interactive data visualization is available at [https://shootingchart-seminar1.netlify.app/](https://shootingchart-seminar1.netlify.app/). It is about Luka Doncic's throws, which can be sorted in different ways, and by clicking on a throw you can see the details of that throw. This allows us to compare the efficiency of the throws, and the number of throws from each position in different situations, which the user can choose.

#### How to run the project locally:

1. Right click on the index.html file in the VSCODE tab on the left Explorer panel.
2. If you don't have the Live Server extension installed, you can install it from the Extensions view.
3. Select Open Live Server.
4. A window will open in your default browser with the output of your project.

### Question: How efficient is Luka Dončić in different areas of the court based on the opponent, year, specific date, and quarter?

Answer: Through an interactive visualization, users can explore and filter Luka Dončić's shooting data to compare his shooting efficiency and points scored in different situations. By using filters such as year, date, quarter, and opponent, one can analyze how his efficiency changes based on shooting percentages and points scored depending on these factors. This allows for an analysis of how many points he scores solely from field goals, providing a deeper insight into his scoring methods and efficiency in different areas of the court.

## Features

- **Interactive Visualization**: The application provides an interactive shooting chart where users can visualize Luka Doncic's shot data.
- **Filtering Options**: Users can filter the shots based on different criteria such as year, quarter, opposing team, and date.
- **Year Slider**: A slider allows users to select a specific year or view all years combined.
- **Quarter Dropdown**: Users can filter the shots by selecting a specific quarter or view all quarters.
- **Team Dropdown**: Users can filter the shots by selecting a specific opposing team or view all teams.
- **Date Picker**: Users can filter the shots by selecting a specific date.
- **All Years Checkbox**: A checkbox allows users to view shots from all years combined.
- **Shot Details**: By clicking on a shot, users can view detailed information about that shot, including the shot zone, action type, shot type, and event type.
- **Efficiency Display**: The application displays the efficiency of shots from different zones, allowing users to compare the performance in various situations.
- **Shot Count Display**: The application displays the total number of shots taken.
- **Points Scored Display**: The application displays the total points scored, but free throws are not included.

## How to Use

1. **Year Slider**: Use the slider to select a specific year or view all years combined.
2. **Quarter Dropdown**: Select a specific quarter or view all quarters.
3. **Team Dropdown**: Select a specific opposing team or view all teams.
4. **Date Picker**: Select a specific date to filter the shots.
5. **All Years Checkbox**: Check the box to view shots from all years combined.
6. **Shot Details**: Click on a shot to view detailed information about that shot.
7. **Efficiency Display**: View the efficiency of shots from different zones.
8. **Shot Count Display**: View the total number of shots taken.
9. **Points Scored Display**: View the total points scored, excluding free throws.

## Technologies Used

- **HTML**: For structuring the web page.
- **CSS**: For styling the web page.
- **JavaScript**: For implementing the interactive features.
- **p5.js**: For drawing the shooting chart and handling user interactions.
- **nba_api**: For fetching the shot data from the NBA API.
- **Pandas**: For processing the shot data.
- **Netlify**: For deploying the application.
