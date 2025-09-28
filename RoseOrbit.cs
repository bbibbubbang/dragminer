using UnityEngine;

public class RoseOrbit : MonoBehaviour
{
    [Header("Orbit Target")]
    public Transform target;

    [Header("Rose Curve Parameters")]
    public float A = 1f;
    public int k = 3;
    public float angularSpeed = 1f;
    public bool clockwise = true;
    public float phase = 0f;
    public Vector2 worldOffset = Vector2.zero;
    [Range(0f, 1f)]
    public float followLerp = 1f;
    public float minAbsR = 0f;

    private float theta;
    private Vector3 currentCenter;
    private bool initialized;

    private void Awake()
    {
        InitializeCenter();
    }

    private void OnEnable()
    {
        InitializeCenter();
    }

    private void InitializeCenter()
    {
        if (initialized)
        {
            return;
        }

        if (target != null)
        {
            currentCenter = target.position + (Vector3)worldOffset;
        }
        else
        {
            currentCenter = transform.position;
        }

        theta = 0f;
        initialized = true;
    }

    private void Update()
    {
        if (target == null)
        {
            return;
        }

        float direction = clockwise ? 1f : -1f;
        theta += direction * angularSpeed * Time.deltaTime;

        Vector3 desiredCenter = target.position + (Vector3)worldOffset;
        float lerpFactor = followLerp <= 0f ? 1f : 1f - Mathf.Exp(-followLerp * Time.deltaTime);
        lerpFactor = Mathf.Clamp01(lerpFactor);
        currentCenter = Vector3.Lerp(currentCenter, desiredCenter, lerpFactor);

        float adjustedTheta = theta + phase;
        float radius = A * Mathf.Cos(k * adjustedTheta);

        if (minAbsR > 0f)
        {
            float sign = radius >= 0f ? 1f : -1f;
            if (Mathf.Abs(radius) < minAbsR)
            {
                radius = sign * minAbsR;
            }
        }

        float cosTheta = Mathf.Cos(adjustedTheta);
        float sinTheta = Mathf.Sin(adjustedTheta);

        Vector3 offset = new Vector3(radius * cosTheta, radius * sinTheta, 0f);
        Vector3 newPosition = currentCenter + offset;
        newPosition.z = transform.position.z;

        transform.position = newPosition;
    }
}
