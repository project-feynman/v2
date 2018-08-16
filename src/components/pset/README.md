There are three possible states with the duration form
1) User is not finished
2) User has not finished but has not submitted a time estimate
3) User has finished and submitted a time estimate

Case 1) is handled by the Pset component, in that it'll never render the duration form if the user is not finished
Case 2) and 3), however, is handled by the QuestionDuration component internally 
