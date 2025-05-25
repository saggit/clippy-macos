#!/bin/bash

# Default values
ANIMATIONS_JSON=""
SPRITESHEET_PNG=""
ANIMATION_FILTER=""
OUTPUT_DIR=""
GENERATE_TSX=true
TSX_OUTPUT_FILE=""
FORCE_OVERWRITE=false

usage() {
    echo "Usage: $0 [options]"
    echo "Options:"
    echo "  -j, --json FILE       Animations JSON file (required)"
    echo "  -s, --spritesheet FILE Spritesheet PNG file (required)"
    echo "  -a, --animations LIST  Comma-separated list of animations to extract (optional)"
    echo "  -o, --output DIR       Output directory (default: <json_basename>_output)"
    echo "  -t, --tsx FILE         Generate TSX file with animation info (default: ../src/renderer/clippy-animations.tsx)"
    echo "  --no-tsx               Don't generate TSX file"
    echo "  -f, --force            Force overwrite existing animations"
    echo "  -h, --help             Display this help message"
    echo ""
    echo "Example: $0 -j animations.json -s map.png -a Idle,LookRight -o ./output"
    exit 1
}

while [ "$#" -gt 0 ]; do
    case "$1" in
        -j|--json)
            ANIMATIONS_JSON="$2"
            shift 2
            ;;
        -s|--spritesheet)
            SPRITESHEET_PNG="$2"
            shift 2
            ;;
        -a|--animations)
            ANIMATION_FILTER="$2"
            shift 2
            ;;
        -o|--output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        -t|--tsx)
            TSX_OUTPUT_FILE="$2"
            shift 2
            ;;
        --no-tsx)
            GENERATE_TSX=false
            shift
            ;;
        -f|--force)
            FORCE_OVERWRITE=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

# Check required parameters
if [ -z "$ANIMATIONS_JSON" ] || [ -z "$SPRITESHEET_PNG" ]; then
    echo "Error: Both animations JSON file (-j) and spritesheet PNG file (-s) are required."
    usage
fi

# Set default TSX output file if not specified
if [ "$GENERATE_TSX" = true ] && [ -z "$TSX_OUTPUT_FILE" ]; then
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    TSX_OUTPUT_FILE="${SCRIPT_DIR}/../src/renderer/clippy-animations.tsx"
fi

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
    echo "ImageMagick is not installed. Please install it using:"
    echo "brew install imagemagick"
    exit 1
fi

# Check if apngasm is installed
if ! command -v apngasm &> /dev/null; then
    echo "apngasm is not installed. Please install it using:"
    echo "brew install apngasm"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "jq is not installed. Please install it using:"
    echo "brew install jq"
    exit 1
fi

# Check if required files exist
if [ ! -f "$ANIMATIONS_JSON" ]; then
    echo "File not found: $ANIMATIONS_JSON"
    exit 1
fi

if [ ! -f "$SPRITESHEET_PNG" ]; then
    echo "File not found: $SPRITESHEET_PNG"
    exit 1
fi

# Set default output directory if not specified
if [ -z "$OUTPUT_DIR" ]; then
    BASE_NAME=$(basename "$ANIMATIONS_JSON" .json)
    OUTPUT_DIR="${BASE_NAME}_output"
fi

# Create temporary working directory
TEMP_WORK_DIR="${OUTPUT_DIR}_temp"
mkdir -p "${TEMP_WORK_DIR}/frames"
mkdir -p "${TEMP_WORK_DIR}/animations"

# Create final output directory
mkdir -p "${OUTPUT_DIR}"

# Get the dimensions of a single frame
# This assumes all frames are the same size
# We'll use ImageMagick to get the dimensions of the spritesheet
SPRITESHEET_INFO=$(magick identify -format "%w %h" "$SPRITESHEET_PNG")
SPRITESHEET_WIDTH=$(echo $SPRITESHEET_INFO | cut -d' ' -f1)
SPRITESHEET_HEIGHT=$(echo $SPRITESHEET_INFO | cut -d' ' -f2)

# Count the number of columns and rows in the spritesheet
# This is a bit of a guess based on the JSON data
MAX_COLUMN=$(jq -r '[.[] | .Frames[] | .ImagesOffsets.Column] | max' "$ANIMATIONS_JSON")
MAX_ROW=$(jq -r '[.[] | .Frames[] | .ImagesOffsets.Row] | max' "$ANIMATIONS_JSON")

# Calculate frame dimensions
FRAME_WIDTH=$((SPRITESHEET_WIDTH / (MAX_COLUMN + 1)))
FRAME_HEIGHT=$((SPRITESHEET_HEIGHT / (MAX_ROW + 1)))

echo "Spritesheet dimensions: ${SPRITESHEET_WIDTH}x${SPRITESHEET_HEIGHT}"
echo "Frame dimensions: ${FRAME_WIDTH}x${FRAME_HEIGHT}"
echo "Grid: $((MAX_COLUMN + 1)) columns x $((MAX_ROW + 1)) rows"

# Extract the default frame (first frame at column 0, row 0)
if [ "$FORCE_OVERWRITE" = true ] || [ ! -f "${OUTPUT_DIR}/Default.png" ]; then
    echo "Extracting default frame (column 0, row 0)"
    DEFAULT_FRAME="${TEMP_WORK_DIR}/Default.png"
    magick "$SPRITESHEET_PNG" -crop ${FRAME_WIDTH}x${FRAME_HEIGHT}+0+0 "$DEFAULT_FRAME"
    if [ -f "$DEFAULT_FRAME" ]; then
        cp "$DEFAULT_FRAME" "${OUTPUT_DIR}/Default.png"
        echo "Created Default.png from first frame"
    else
        echo "Error: Failed to create default frame"
    fi
else
    echo "Skipping default frame (already exists)"
fi

# Only convert animation filter to array if it's not empty
if [ -n "$ANIMATION_FILTER" ]; then
    echo "Filtering animations: $ANIMATION_FILTER"
    IFS=',' read -ra ANIMATION_ARRAY <<< "$ANIMATION_FILTER"
else
    echo "Processing all animations"
    # Create an empty array
    ANIMATION_ARRAY=()
fi

# Initialize a temporary file to store animation durations
DURATIONS_FILE="${TEMP_WORK_DIR}/durations.txt"
touch "$DURATIONS_FILE"

# Process each animation
jq -c '.[]' "$ANIMATIONS_JSON" | while read -r animation; do
    NAME=$(echo $animation | jq -r '.Name')

    # Skip this animation if a filter is provided and doesn't match
    if [ -n "$ANIMATION_FILTER" ]; then
        MATCH=0
        for ANIM in "${ANIMATION_ARRAY[@]}"; do
            if [ "$NAME" = "$ANIM" ]; then
                MATCH=1
                break
            fi
        done
        if [ $MATCH -eq 0 ]; then
            continue
        fi
    fi

    # Check if animation already exists and skip if not forcing overwrite
    if [ "$FORCE_OVERWRITE" = false ] && [ -f "${OUTPUT_DIR}/${NAME}.png" ]; then
        echo "Skipping animation: $NAME (already exists)"

        # Calculate the total duration from JSON data for consistency
        TOTAL_DURATION=0
        while read -r frame; do
            DURATION=$(echo $frame | jq -r '.Duration')
            TOTAL_DURATION=$((TOTAL_DURATION + DURATION))
        done < <(echo $animation | jq -c '.Frames[]')

        echo "${NAME}:${TOTAL_DURATION}" >> "$DURATIONS_FILE"
        echo "Calculated duration for $NAME: $TOTAL_DURATION ms"

        continue
    fi

    echo "Processing animation: $NAME"

    # Create a temporary directory for this animation's frames
    TEMP_DIR="${TEMP_WORK_DIR}/frames/$NAME"
    mkdir -p "$TEMP_DIR"

    # Extract frame information
    FRAME_COUNT=$(echo $animation | jq '.Frames | length')
    echo "Animation has $FRAME_COUNT frames"

    # Process each frame
    FRAME_INDEX=0
    FRAME_FILES=()
    FRAME_DELAYS=()
    TOTAL_DURATION=0

    # First pass: extract all frames
    while read -r frame; do
        DURATION=$(echo $frame | jq -r '.Duration')
        COLUMN=$(echo $frame | jq -r '.ImagesOffsets.Column')
        ROW=$(echo $frame | jq -r '.ImagesOffsets.Row')

        # Calculate the position of the frame in the spritesheet
        X=$((COLUMN * FRAME_WIDTH))
        Y=$((ROW * FRAME_HEIGHT))

        # Extract the frame from the spritesheet
        FRAME_FILE=$(printf "$TEMP_DIR/frame_%03d.png" $FRAME_INDEX)
        magick "$SPRITESHEET_PNG" -crop ${FRAME_WIDTH}x${FRAME_HEIGHT}+${X}+${Y} "$FRAME_FILE"

        # Check if the frame was created successfully
        if [ ! -f "$FRAME_FILE" ]; then
            echo "Error: Failed to create frame file: $FRAME_FILE"
            continue
        fi

        # Convert duration from milliseconds to 1/1000 seconds for apngasm
        DELAY_MS=$DURATION
        TOTAL_DURATION=$((TOTAL_DURATION + DELAY_MS))

        FRAME_FILES+=("$FRAME_FILE")
        FRAME_DELAYS+=($DELAY_MS)

        FRAME_INDEX=$((FRAME_INDEX + 1))
    done < <(echo $animation | jq -c '.Frames[]')

    # Verify we have frames
    if [ ${#FRAME_FILES[@]} -eq 0 ]; then
        echo "Error: No frames found for animation $NAME"
        continue
    fi

    echo "${NAME}:${TOTAL_DURATION}" >> "$DURATIONS_FILE"
    echo "Total duration for $NAME: $TOTAL_DURATION ms"

    # For single frame animations, just copy the PNG file
    if [ ${#FRAME_FILES[@]} -eq 1 ]; then
        cp "${FRAME_FILES[0]}" "${TEMP_WORK_DIR}/animations/${NAME}.png"
        echo "Created ${TEMP_WORK_DIR}/animations/${NAME}.png with 1 frame"
        continue
    fi

    # Build apngasm command
    APNG_CMD="apngasm -o \"${TEMP_WORK_DIR}/animations/${NAME}.png\""

    for i in "${!FRAME_FILES[@]}"; do
        APNG_CMD="$APNG_CMD \"${FRAME_FILES[$i]}\" ${FRAME_DELAYS[$i]}"
    done

    # Execute the command
    echo "Running: $APNG_CMD"
    eval $APNG_CMD

    # Check if the animation was created successfully
    if [ -f "${TEMP_WORK_DIR}/animations/${NAME}.png" ]; then
        echo "Created ${TEMP_WORK_DIR}/animations/${NAME}.png with ${#FRAME_FILES[@]} frames"
    else
        echo "Error: Failed to create animation ${NAME}.png"
        echo "Please check the apngasm command and ensure it's installed correctly."
    fi
done

# Copy all animations to the final output directory
echo "Copying animations to output directory..."
find "${TEMP_WORK_DIR}/animations" -name "*.png" -exec cp {} "${OUTPUT_DIR}/" \;

# Count the number of animations created
ANIMATION_COUNT=$(find "${OUTPUT_DIR}" -name "*.png" | wc -l)
echo "Successfully created $ANIMATION_COUNT animations in ${OUTPUT_DIR}"

# Generate TSX file if requested
if [ "$GENERATE_TSX" = true ]; then
    echo "Generating TSX file at ${TSX_OUTPUT_FILE}..."

    # Start TSX file content
    TSX_CONTENT="// This file is auto-generated by extract-animations.sh\n\n"

    # Add Animation interface
    TSX_CONTENT="${TSX_CONTENT}export interface Animation {\n  src: string;\n  length: number;\n}\n\n"

    # Add imports for each animation
    for PNG_FILE in "${OUTPUT_DIR}"/*.png; do
        BASE_NAME=$(basename "$PNG_FILE" .png)
        IMPORT_NAME=$(echo "$BASE_NAME" | sed 's/[^a-zA-Z0-9]/_/g')
        TSX_CONTENT="${TSX_CONTENT}import ${IMPORT_NAME} from './images/animations/${BASE_NAME}.png';\n"
    done

    # Start ANIMATIONS object
    TSX_CONTENT="${TSX_CONTENT}\nexport const ANIMATIONS: Record<string, Animation> = {\n"

    # Add each animation with its duration
    for PNG_FILE in "${OUTPUT_DIR}"/*.png; do
        BASE_NAME=$(basename "$PNG_FILE" .png)
        IMPORT_NAME=$(echo "$BASE_NAME" | sed 's/[^a-zA-Z0-9]/_/g')
        ANIMATION_NAME=$(echo "$BASE_NAME" | sed 's/_/ /g')

        # Get duration from our stored values
        DURATION=$(grep "^${BASE_NAME}:" "$DURATIONS_FILE" | cut -d':' -f2)

        # If we don't have the duration (which shouldn't happen, but just in case)
        if [ -z "$DURATION" ]; then
            echo "Warning: No duration found for $BASE_NAME, using 0"
            DURATION=0
        fi

        TSX_CONTENT="${TSX_CONTENT}  '${ANIMATION_NAME}': {\n    src: ${IMPORT_NAME},\n    length: ${DURATION}\n  },\n"
    done

    # Close ANIMATIONS object
    TSX_CONTENT="${TSX_CONTENT}};\n"

    # Write TSX file
    echo -e "$TSX_CONTENT" > "$TSX_OUTPUT_FILE"
    echo "Successfully generated TSX file at ${TSX_OUTPUT_FILE}"
fi

# Clean up temporary files
echo "Cleaning up temporary files..."
rm -rf "${TEMP_WORK_DIR}"

echo "All animations processed successfully!"
echo "Output files are in the '${OUTPUT_DIR}' directory"
