def calculate_median(values):
    if not values:
        return 0
    sorted_values = sorted(values)
    mid = len(sorted_values) // 2
    if len(sorted_values) % 2 == 0:
        return (sorted_values[mid - 1] + sorted_values[mid]) / 2
    else:
        return sorted_values[mid]

def angle_difference(angle1, angle2):
    diff = (angle1 - angle2 + 540) % 360 - 180
    return diff