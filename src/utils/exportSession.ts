export function exportSession() {
    let summary = `
  Kev Workout A
  
  Date:
  ${new Date().toLocaleDateString()}
  `;
  
    navigator.clipboard.writeText(
      summary
    );
  
    alert(
      "Workout copied to clipboard"
    );
  }