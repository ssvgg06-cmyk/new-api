package openai

import (
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/dto"
	"github.com/stretchr/testify/require"
)

func TestApplyClaudeOpenAISamplingCompatibilityPrefersTemperature(t *testing.T) {
	request := &dto.GeneralOpenAIRequest{
		Model:       "claude-sonnet-4-5",
		Temperature: common.GetPointer[float64](0.7),
		TopP:        common.GetPointer[float64](1),
	}

	applyClaudeOpenAISamplingCompatibility("", request)

	require.NotNil(t, request.Temperature)
	require.Equal(t, 0.7, *request.Temperature)
	require.Nil(t, request.TopP)
}

func TestApplyClaudeOpenAISamplingCompatibilityRemovesOpus47SamplingParameters(t *testing.T) {
	request := &dto.GeneralOpenAIRequest{
		Model:       "claude-sonnet-4-5",
		Temperature: common.GetPointer[float64](0.7),
		TopP:        common.GetPointer[float64](1),
		TopK:        common.GetPointer[int](4),
	}

	applyClaudeOpenAISamplingCompatibility("claude-opus-4-7", request)

	require.Nil(t, request.Temperature)
	require.Nil(t, request.TopP)
	require.Nil(t, request.TopK)
}
