export default function PatientTable({history}) {

  return(

    <div className="card">

      <h3>Patient Records</h3>

      <table className="table">

        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Result</th>
            <th>Confidence</th>
          </tr>
        </thead>

        <tbody>

          {history.map(p => (
            <tr key={p._id}>
              <td>{p.patient?.name}</td>
              <td>{p.patient?.age}</td>
              <td>{p.disease ? "Positive" : "Negative"}</td>
              <td>{(p.confidence*100).toFixed(1)}%</td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>

  );

}